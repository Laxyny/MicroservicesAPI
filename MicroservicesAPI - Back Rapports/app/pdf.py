import io, base64, jinja2, os, matplotlib.pyplot as plt
from app.utils import get_store_stats, get_product_stats
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
