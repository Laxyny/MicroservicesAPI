import io, base64, jinja2, os, matplotlib.pyplot as plt
from app.utils import get_store_stats, get_product_stats
from app.utils import get_order_details
from weasyprint import HTML

env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), "templates"))
)

async def build_pdf(db, report):
    store_stats = await get_store_stats(db, report)    
    product_stats = (
        await get_product_stats(db, report) if report.includeProducts else []
    )
    charts = {}
    
    if report.includeCharts:
        fig, ax = plt.subplots()
        ax.bar([p["name"] for p in product_stats], [p["price"] for p in product_stats])
        buf = io.BytesIO()
        fig.savefig(buf, format="png")
        charts["sales_chart"] = base64.b64encode(buf.getvalue()).decode()
        plt.close(fig)
    tpl = env.get_template("report.html")
    html = tpl.render(
        store=store_stats,
        products=product_stats,
        charts=charts,
        branding="Le Petit Livreur",
    )
    pdf = HTML(string=html).write_pdf()
    return pdf

async def build_invoice_pdf(db, invoice):
    order_data = await get_order_details(db, invoice.orderId)
    if not order_data:
        return None
    
    template_data = {}
    
    template_data["order"] = order_data["order"].copy()
    template_data["order"]["order_items"] = template_data["order"].pop("items")
    
    template_data["subtotal"] = order_data["subtotal"]
    template_data["shipping"] = order_data["shipping"]
    
    tpl = env.get_template("invoice.html")
    html = tpl.render(**template_data)
    pdf = HTML(string=html).write_pdf()
    return pdf