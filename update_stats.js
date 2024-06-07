const fs = require('fs');
const path = require('path');

// Load the family tree data from alseyat.js
const data = require('./alseyat.js').default;

function prepareStatistics(data) {
    const nameCount = {};
    const childrenCount = [];
    let totalMembers = 0;

    function computeStatistics(node, fullName = "") {
        totalMembers++;

        const currentFullName = fullName ? `${node.name} بن ${fullName}` : node.name;

        // Count the current node's name
        if (nameCount[node.name]) {
            nameCount[node.name]++;
        } else {
            nameCount[node.name] = 1;
        }

        // Count children if any
        const numChildren = node.children ? node.children.length : 0;
        if (numChildren > 0) {
            childrenCount.push({ fullName: currentFullName, children: numChildren });
        }

        // Recursively process children
        if (node.children) {
            node.children.forEach(child => computeStatistics(child, currentFullName));
        }
    }

    computeStatistics(data);

    // Group names by their count
    const groupedNames = {};
    Object.entries(nameCount).forEach(([name, count]) => {
        if (!groupedNames[count]) {
            groupedNames[count] = [];
        }
        groupedNames[count].push(name);
    });

    // Convert grouped names to an array
    const topNames = Object.entries(groupedNames)
        .map(([count, names]) => [names.join('، '), count]);

    // Get top ten people with the most children
    const topChildren = childrenCount
        .sort((a, b) => b.children - a.children)
        .slice(0, 10); // Limit to top 10

    return { topNames, topChildren, totalMembers };
}

// Prepare statistics from the family tree data
const statistics = prepareStatistics(data);

// Write the statistics to statistics.json
fs.writeFileSync(path.join(__dirname, 'statistics.json'), JSON.stringify(statistics, null, 2));
