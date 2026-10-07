let columns = ['A', 'B', 'C'];
let group = ['A'];
let rows = [
    ['A1', 'B1', 'C1'],
    ['A2', 'B2', 'C2'],
    ['A3', 'B3', 'C3']
]


const fmt = (v) => (v === null ? "" : String(v));
function renderList({ columns, rows, group = [] }) {
    const groupIdx = group.map((g) => columns.indexOf(g)).filter((i) => i >= 0);
    const itemIdx = columns.map((_, i) => i).filter((i) => !groupIdx.includes(i));
    const groups = new Map(); // Map keeps first-seen order
    for (const row of rows) {
        const key = groupIdx.map((i) => fmt(row[i])).join(" / ");
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(row);
    }
    for (const [key, groupRows] of groups) {
        if (groupIdx.length) console.log('h2:', key);
        let ul = ">>\n";
        for (const row of groupRows) {
            // Single remaining column -> just the value; otherwise "Column: value, ..."
            const text =
                itemIdx.length === 1
                    ? fmt(row[itemIdx[0]])
                    : itemIdx.map((i) => `${columns[i]}: ${fmt(row[i])}`).join(", ");
            ul += `- ${text}\n`;
        }
        console.log(ul);
    }
}
renderList({ columns, rows, group });