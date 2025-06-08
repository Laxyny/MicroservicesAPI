import io, base64, jinja2, os, matplotlib.pyplot as plt
from app.utils import get_store_stats, get_product_stats
from app.utils import get_order_details
from weasyprint import HTML
import dateutil.parser
import datetime

env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.join(os.path.dirname(__file__), "templates"))
)


async def build_pdf(db, report):
    store_stats = await get_store_stats(db, report)

    if store_stats.get("createdAt"):
        try:
            dt = store_stats["createdAt"]
            if not isinstance(dt, datetime.datetime):
                dt = dateutil.parser.parse(str(dt))
            store_stats["createdAtFormatted"] = dt.strftime("%d/%m/%Y à %H:%M")
        except Exception:
            store_stats["createdAtFormatted"] = store_stats["createdAt"]

    product_stats = (
        await get_product_stats(db, report) if report.includeProducts else []
    )
    charts = {}

    total_sales = (
        sum(p.get("total_sales", 0) or 0 for p in product_stats) if product_stats else 0
    )

    if report.includeCharts and product_stats:
        top_products = sorted(
            product_stats, key=lambda x: x["total_sales"], reverse=True
        )[:5]

        fig, ax = plt.subplots(figsize=(10, 6))
        names = [p["name"] for p in top_products]
        sales = [p["total_sales"] for p in top_products]

        bars = ax.bar(names, sales, color="skyblue")
        ax.set_title("Top 5 des ventes par produit")
        ax.set_xlabel("Produits")
        ax.set_ylabel("Ventes (€)")

        for bar in bars:
            height = bar.get_height()
            ax.annotate(
                f"{height} €",
                xy=(bar.get_x() + bar.get_width() / 2, height),
                xytext=(0, 3),
                textcoords="offset points",
                ha="center",
                va="bottom",
            )

        plt.xticks(rotation=45, ha="right")
        plt.tight_layout()

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
        total_sales=total_sales,
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