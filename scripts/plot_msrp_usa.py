import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from pathlib import Path

data = [
    ("Cadillac", 50474.375),
    ("Hummer", 49995.0),
    ("Lincoln", 42875.555556),
    ("Buick", 30537.777778),
    ("GMC", 29560.5),
    ("Mercury", 27972.777778),
    ("Chrysler", 27252.0),
    ("Chevrolet", 26587.037037),
    ("Dodge", 26253.846154),
    ("Jeep", 24518.333333),
    ("Pontiac", 24156.363636),
    ("Ford", 24015.869565),
    ("Oldsmobile", 23763.333333),
    ("Saturn", 17234.375),
]

# Sort by value descending
data.sort(key=lambda x: x[1], reverse=True)
makes = [d[0] for d in data]
values = [d[1] for d in data]

out_dir = Path('outputs')
out_dir.mkdir(parents=True, exist_ok=True)
out_file = out_dir / 'make_avg_msrp_usa.png'

plt.figure(figsize=(12, 6))
bars = plt.bar(makes, values, color='tab:blue')
plt.title('Average MSRP by Make (Origin = USA)')
plt.ylabel('Average MSRP')
plt.xticks(rotation=45, ha='right')
plt.tight_layout()

# Annotate bars
for bar in bars:
    height = bar.get_height()
    plt.annotate(f'{height:,.0f}',
                 xy=(bar.get_x() + bar.get_width() / 2, height),
                 xytext=(0, 3),
                 textcoords='offset points',
                 ha='center', va='bottom', fontsize=8)

plt.savefig(out_file)
print(f'Plot saved to {out_file}')
