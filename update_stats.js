const fs = require('fs');
const data = require('./alseyat.js').default;

function prepareStatistics(data) {
    const nameCount = {};
    const childrenCount = [];
    let totalMembers = 0;

    function computeStatistics(node, fullName = "") {
        totalMembers++;

        const currentFullName = fullName ? `${node.name} بن ${fullName}` : node.name;

        if (nameCount[node.name]) {
            nameCount[node.name]++;
        } else {
            nameCount[node.name] = 1;
        }

        const numChildren = node.children ? node.children.length : 0;
        if (numChildren > 0) {
            childrenCount.push({ fullName: currentFullName, children: numChildren });
        }

        if (node.children) {
            node.children.forEach(child => computeStatistics(child, currentFullName));
        }
    }

    computeStatistics(data);

    const groupedNames = {};
    Object.entries(nameCount).forEach(([name, count]) => {
        if (!groupedNames[count]) {
            groupedNames[count] = [];
        }
        groupedNames[count].push(name);
    });

    const topNames = Object.entries(groupedNames)
        .map(([count, names]) => [names.join('، '), count]);

    const topChildren = childrenCount
        .sort((a, b) => b.children - a.children)
        .slice(0, 10);

    return { topNames, topChildren, totalMembers };
}

const statistics = prepareStatistics(data);
fs.writeFileSync('statistics.json', JSON.stringify(statistics, null, 2));
