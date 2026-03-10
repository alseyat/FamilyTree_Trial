import data from './alseyat.js';

const margin = { top: 200, right: 20, bottom: 20, left: 300 };
let width = 1200, height = 2000;

let i = 0, duration = 150, delay = 50;
let firstHighlightDelay = 400, secondHighlightDelay = 800, thirdHighlightDelay = 1200, fourthHighlightDelay = 300;

let zoomLevel = 1;
let currentAdjustment = 0;

const svg = d3.select("#tree-container").append("svg")
    .attr("width", width)
    .attr("height", height);

const svgGroup = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tree = d3.tree().nodeSize([120, 50])
    .separation((a, b) => a.parent === b.parent ? 1 : 1.25);

let root = d3.hierarchy(data);
root.x0 = width / 2;
root.y0 = 0;

const breakpoint = 768;

function isMobile() {
    return window.innerWidth <= breakpoint;
}
const viewportWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

let initialVerticalOffset = 250;
let initialHorizontalOffset = width / 2 + 19;
let initialHorizontalForMobile = 79;

const tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

function getFullName(d) {
    let names = [];
    let current = d;
    while (current) {
        names.push(current.data.name);
        current = current.parent;
    }
    return names.join(' بن ');
}

function reverseChildren(node) {
    if (node.children) {
        node.children.reverse();
        node.children.forEach(reverseChildren);
    }
}

reverseChildren(root);
collapse(root);

function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

function expand(d) {
    if (d._children) {
        d.children = d._children;
        d.children.forEach(expand);
        d._children = null;
    }
}

function update(source, center = false) {
    const treeData = tree(root);
    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);

    nodes.forEach(d => d.y = d.depth * 80);

    // 1. Calculate boundaries based on both X (horizontal) and Y (vertical) depth
    const minX = Math.min(...nodes.map(d => d.x));
    const maxX = Math.max(...nodes.map(d => d.x));
    const maxY = Math.max(...nodes.map(d => d.y));

    const horizontalOffset = isMobile() ? initialHorizontalForMobile : initialHorizontalOffset;

    // 1. Calculate standard adjustment to prevent clipping on the left
    let baseAdjustment = Math.max(0, 100 - (minX + horizontalOffset) * zoomLevel);

    // 2. Calculate exactly where the root node is going to sit on the screen
    const rootXPosition = baseAdjustment + (root.x + horizontalOffset) * zoomLevel;
    const treeContainer = document.getElementById('tree-container');
    const halfContainerWidth = treeContainer.clientWidth / 2;

    // 3. If the tree is small and lacks a scrollbar, physically push the canvas to the center!
    if (rootXPosition < halfContainerWidth) {
        baseAdjustment += (halfContainerWidth - rootXPosition);
    }
    
    currentAdjustment = baseAdjustment;
    // Calculate exact SVG canvas size based on right-most and bottom-most points
    const requiredWidth = currentAdjustment + (maxX + horizontalOffset) * zoomLevel + 300;
    const requiredHeight = 230 + (maxY + initialVerticalOffset) * zoomLevel + 400;

    // Apply the transform
    // Adjust 150 for Mobile and 230 for Desktop
// Adjust 150 for Mobile and 230 for Desktop
const verticalStart = isMobile() ? 10 : 10;
svgGroup.attr("transform", `translate(${currentAdjustment} , ${verticalStart}) scale(${zoomLevel})`);

    // Use the specific ID to ensure we resize the TREE canvas, not the search icons!
    d3.select("#tree-container svg")
        .attr("width", Math.max(window.innerWidth, requiredWidth))
        .attr("height", Math.max(window.innerHeight, requiredHeight));

    const node = svgGroup.selectAll('g.node')
        .data(nodes, d => d.id || (d.id = ++i));

    const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', d => {
            if (isMobile()) {
                return `translate(${source.x + initialHorizontalForMobile},${source.y0 + initialVerticalOffset})`;
            } else {
                return `translate(${source.x + initialHorizontalOffset},${source.y0 + initialVerticalOffset})`;
            }
        })
        .attr('data-id', d => d.id)
        .on('click', click)

    nodeEnter.append('rect')
        .attr('width', 100)
        .attr('height', 40)
        .attr('x', -50)
        .attr('y', -15)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('class', 'node')
        .style('fill', d => d._children ? "#e3d8bc" : "#ffffff");
        
    nodeEnter.append('text')
        .attr('dy', '.23em')
        .attr('x', 0)
        .attr('text-anchor', 'middle')
        .attr("font-family", 'Noto Naskh Arabic, sans-serif')
        .attr("font-size", "20px")
        .text(d => d.data.name);

    const badge = nodeEnter.append('g')
        .attr('class', 'children-badge')
        .attr('transform', 'translate(0, 24)')
        .style('display', d => (d.children || d._children) ? null : 'none');

    badge.append('circle')
        .attr('r', 10)
        .style('fill', '#ea5050')
        .style('stroke', '#fff')
        .style('stroke-width', '2px');

    badge.append('text')
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Noto Naskh Arabic, sans-serif')
        .attr('font-size', '11px')
        .attr('font-weight', 'bold')
        .style('fill', '#fff')
        .text(d => d.children ? d.children.length : (d._children ? d._children.length : ''));

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition()
        .duration(d => d.depth === 0 ? 0 : duration)
        .attr('transform', d => {
            if (isMobile()) {
                return `translate(${d.x + initialHorizontalForMobile},${d.y + initialVerticalOffset})`;
            } else {
                return `translate(${d.x + initialHorizontalOffset},${d.y + initialVerticalOffset})`;
            }
        });
        
    nodeUpdate.select('rect')
        .attr('width', 100)
        .attr('height', 40)
        .attr('x', -50)
        .attr('y', -20)
        .attr('rx', 10)
        .attr('ry', 10)
        .attr('class', d => d._children ? 'has-children' : '')
        .style('fill', d => d._children ? "#e3d8bc" : "#ffffff");
        
    nodeUpdate.select('.children-badge circle')
        .style('fill', d => d._children ? "#ea5050" : "#95a5a6");

    const nodeExit = node.exit().transition()
        .duration(duration)
        .attr('transform', d => {
            if (isMobile()) {
                return `translate(${source.x + initialHorizontalForMobile},${source.y + initialVerticalOffset})`;
            } else {
                return `translate(${source.x + initialHorizontalOffset},${source.y + initialVerticalOffset})`;
            }
        })
        .remove();

    nodeExit.select('rect')
        .attr('width', 100)
        .attr('height', 30)
        .attr('x', -50)
        .attr('y', -15)
        .attr('rx', 10)
        .attr('ry', 10);

    const link = svgGroup.selectAll('path.link')
        .data(links, d => d.id);

    const linkEnter = link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', d => {
            const o = { x: source.x, y: source.y };
            if (isMobile()) {
                return `M${o.x + initialHorizontalForMobile},${o.y + initialVerticalOffset}V${o.y + initialVerticalOffset}H${d.x + initialHorizontalForMobile}V${d.y + initialVerticalOffset}`;
            } else {
                return `M${o.x + initialHorizontalOffset},${o.y + initialVerticalOffset}V${o.y + initialVerticalOffset}H${d.x + initialHorizontalOffset}V${d.y + initialVerticalOffset}`;
            }
        });

    const linkUpdate = linkEnter.merge(link);

    linkUpdate.transition()
        .duration(duration)
        .attr('d', d => {
            if (isMobile()) {
                return `M${d.parent.x + initialHorizontalForMobile},${d.parent.y + initialVerticalOffset}V${d.parent.y + 45 + initialVerticalOffset}H${d.x + initialHorizontalForMobile}V${d.y + initialVerticalOffset}`;
            } else {
                return `M${d.parent.x + initialHorizontalOffset},${d.parent.y + initialVerticalOffset}V${d.parent.y + 45 + initialVerticalOffset}H${d.x + initialHorizontalOffset}V${d.y + initialVerticalOffset}`;
            }
        });
        
    const linkExit = link.exit()
        .attr('d', d => {
            const o = { x: source.x, y: source.y };
            if (isMobile()) {
                return `M${o.x + initialHorizontalForMobile},${o.y + initialVerticalOffset}V${o.y}H${d.x}V${d.y + initialVerticalOffset}`;
            } else {
                return `M${o.x + initialHorizontalOffset},${o.y + initialVerticalOffset}V${o.y}H${d.x}V${d.y + initialVerticalOffset}`;
            }
        })
        .remove();

    nodes.forEach(d => {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    if (center) {
        centerTopNode();
    }
}

function click(event, d) {
    let hasChanges = false;

    if (d.children) {
        d._children = d.children.concat(d._children || []);
        d.children = null;
        hasChanges = true;
    } else {
        if (d._children) {
            d.children = d._children;
            d._children = null;
            hasChanges = true;

            d.children.forEach(child => {
                if (child.children) {
                    child._children = child.children;
                    child.children = null;
                }
            });
        }
    }

    if (hasChanges) {
        const horizontalOffset = isMobile() ? initialHorizontalForMobile : initialHorizontalOffset;
        
        // Store old math using currentAdjustment BEFORE it changes
        const oldAdjustment = currentAdjustment;
        const oldX = oldAdjustment + (d.x0 + horizontalOffset) * zoomLevel;
        const oldY = 230 + (d.y0 + initialVerticalOffset) * zoomLevel;

        update(d);

        // Calculate new position using the updated currentAdjustment and new d.x
        const newX = currentAdjustment + (d.x + horizontalOffset) * zoomLevel;
        const newY = 230 + (d.y + initialVerticalOffset) * zoomLevel;

        const treeContainer = document.getElementById('tree-container');
        treeContainer.scrollLeft += (newX - oldX);
        treeContainer.scrollTop += (newY - oldY);
    }
}

function focusOnNodeFromSearch(fullName) {
    const nameParts = fullName.split(' بن ').reverse();
    let currentNode = root;
    let pathNodes = [root];

    let counter = 1;

    for (let part of nameParts) {
        if (nameParts.length === 1) {
            centerNode(currentNode);
            return;
        }

        if (!currentNode.children || currentNode.children.length === 0) {
            if (currentNode._children) {
                currentNode.children = currentNode._children;
                currentNode._children = null;
                update(root);
            } else {
                return;
            }
        }

        let matchingChild = currentNode.children.find(child => child.data.name === nameParts[counter]);

        if (!matchingChild) {
            return;
        }

        currentNode = matchingChild;
        pathNodes.push(currentNode);
        counter++;

        if (counter === nameParts.length) {
            break;
        }
        expandNode(currentNode);
        update(root);
    }

    setTimeout(() => {
        centerNode(currentNode);
    }, delay);
}

function expandNode(node) {
    if (!node.children && node._children) {
        node.children = node._children;
        node._children = null;
    }
}

function isTreeFullyExpanded(node) {
    if (node._children) return false;
    if (node.children) {
        for (let child of node.children) {
            if (!isTreeFullyExpanded(child)) return false;
        }
    }
    return true;
}

function centerNode(source) {
    const nodeElement = d3.select(`[data-id='${source.id}']`);
    const rectElement = nodeElement.select('rect').node();
    const textElement = nodeElement.select('text').node();
    const treeContainer = document.getElementById('tree-container');

    if (rectElement && textElement && treeContainer) {
        
        // 1. Calculate the exact pixel location of the node
        const horizontalOffset = isMobile() ? initialHorizontalForMobile : initialHorizontalOffset;
        const nodeX = currentAdjustment + (source.x + horizontalOffset) * zoomLevel;
        const nodeY = 230 + (source.y + initialVerticalOffset) * zoomLevel;

        // 2. Smoothly scroll the container so this exact pixel is perfectly in the center of the screen
        treeContainer.scrollTo({
            left: nodeX - (treeContainer.clientWidth / 2),
            top: nodeY - (treeContainer.clientHeight / 2),
            behavior: 'smooth'
        });

        // 3. Flash the highlight colors (This remains exactly the same as before)
        rectElement.classList.add('highlight');
        textElement.classList.add('highlight');

        setTimeout(() => {
            rectElement.classList.remove('highlight');
            textElement.classList.remove('highlight');
        }, firstHighlightDelay);

        setTimeout(() => {
            rectElement.classList.add('highlight');
            textElement.classList.add('highlight');
        }, firstHighlightDelay * 2);

        setTimeout(() => {
            rectElement.classList.remove('highlight');
            textElement.classList.remove('highlight');
        }, firstHighlightDelay * 3);

        setTimeout(() => {
            rectElement.classList.add('highlight');
            textElement.classList.add('highlight');
        }, firstHighlightDelay * 4);

        setTimeout(() => {
            rectElement.classList.remove('highlight');
            textElement.classList.remove('highlight');
        }, firstHighlightDelay * 5);
    }
}

function displaySearchResults(query) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';
    if (query.length < 1) {
        searchResults.style.display = 'none';
        return;
    }
    const matchedNames = searchTreeNames(data, query);

    matchedNames.forEach((fullName, index) => {
        const li = document.createElement('li');
        li.innerText = `${index + 1}- ${fullName}`;

        li.addEventListener('click', function () {
            focusOnNodeFromSearch(fullName);
            
            // Hide everything and reset back to the icon
            document.getElementById('search-results').style.display = 'none';
            document.getElementById('search-wrapper-floating').style.display = 'none';
            document.getElementById('search-icon-btn').style.display = 'flex';
            document.getElementById('search-box').value = ''; // Clear the typed text
        });
        searchResults.appendChild(li);
    });
    searchResults.style.display = matchedNames.length ? 'block' : 'none';
}

function searchTreeNames(node, query, fullName = "", matches = []) {
    const currentFullName = fullName ? `${node.name} بن ${fullName}` : node.name;
    if (currentFullName.toLowerCase().startsWith(query)) {
        matches.push(currentFullName);
    }
    if (node.children) {
        node.children.forEach(child => searchTreeNames(child, query, currentFullName, matches));
    }
    return matches;
}

function centerTopNode() {
    const topNode = d3.select('.node').node();
    const treeContainer = document.getElementById('tree-container');
    if (topNode && treeContainer) {
        const topNodeBox = topNode.getBoundingClientRect();
        const containerBox = treeContainer.getBoundingClientRect();

        treeContainer.scrollLeft += (topNodeBox.left - containerBox.left) - (containerBox.width / 2) + (topNodeBox.width / 2);
        treeContainer.scrollTop += (topNodeBox.top - containerBox.top) - (containerBox.height / 2) + (topNodeBox.height / 2);
    }
}

function expandTree() {
    let originalDuration = duration;
    duration = 0;
    expandAll(root);
    update(root);
    centerParentNode(true); // تمرير true لجعل التوسيط فورياً بدون أنيميشن
    duration = originalDuration;
}

function collapseTree() {
    let originalDuration = duration;
    duration = 0;
    collapseAll(root);
    update(root);
    centerParentNode(true); // تمرير true لجعل التوسيط فورياً بدون أنيميشن
    duration = originalDuration;
}

// أضفنا متغير isInstant بقيمة افتراضية false
function centerParentNode(isInstant = false) {
    const treeContainer = document.getElementById('tree-container');
    const horizontalOffset = isMobile() ? initialHorizontalForMobile : initialHorizontalOffset;
    
    // حساب الإحداثيات الدقيقة للجد الأول
    const nodeX = currentAdjustment + (root.x + horizontalOffset) * zoomLevel;
    const nodeY = 230 + (root.y + initialVerticalOffset) * zoomLevel;

    // التمرير الفوري أو الانسيابي بناءً على المتغير
    treeContainer.scrollTo({
        left: nodeX - (treeContainer.clientWidth / 2),
        top: nodeY - (treeContainer.clientHeight / 2),
        behavior: isInstant ? 'auto' : 'smooth' // 'auto' تعني انتقال فوري
    });
}

function collapseAll(d) {
    if (d.children) {
        d.children.forEach(collapseAll);
        d._children = d.children;
        d.children = null;
    }
}

function expandAll(d) {
    if (d._children) {
        d.children = d._children;
        d._children = null;
    }
    // التأكد من استمرار الفتح للطبقات السفلية حتى لو كانت الطبقة الحالية مفتوحة
    if (d.children) {
        d.children.forEach(expandAll);
    }
}

function zoomIn() {
    const newZoom = Math.min(zoomLevel + 0.1, 1);
    if (newZoom !== zoomLevel) applyZoom(newZoom);
}

function zoomOut() {
    const newZoom = Math.max(zoomLevel - 0.1, 0.2);
    if (newZoom !== zoomLevel) applyZoom(newZoom);
}

function applyZoom(newZoom) {
    const treeContainer = document.getElementById('tree-container');
    
    // 1. Find the exact screen center in pixels
    const centerX = treeContainer.scrollLeft + (treeContainer.clientWidth / 2);
    const centerY = treeContainer.scrollTop + (treeContainer.clientHeight / 2);
    
    // 2. Map this screen center back to the unscaled inner tree coordinates
    const oldZoom = zoomLevel;
    const oldAdjustment = currentAdjustment;
    
    const innerX = (centerX - oldAdjustment) / oldZoom;
    const innerY = (centerY - 230) / oldZoom;
    
    // 3. Apply the new zoom level and update the tree
    zoomLevel = newZoom;
    update(root, false); 
    
    // 4. Map the inner coordinates back to the new screen pixels
    const newCenterX = currentAdjustment + (innerX * zoomLevel);
    const newCenterY = 230 + (innerY * zoomLevel);
    
    // 5. Scroll to lock that exact pixel in the center
    treeContainer.scrollLeft = newCenterX - (treeContainer.clientWidth / 2);
    treeContainer.scrollTop = newCenterY - (treeContainer.clientHeight / 2);
}


document.addEventListener('DOMContentLoaded', function () {
    const searchIconBtn = document.getElementById('search-icon-btn');
    const searchWrapper = document.getElementById('search-wrapper-floating');
    const searchBox = document.getElementById('search-box');
    const searchResults = document.getElementById('search-results');
const searchContainer = document.getElementById('floating-search-container');

    // 1. Open search when icon is clicked
    searchIconBtn.addEventListener('click', function (event) {
        searchIconBtn.style.display = 'none';
        searchWrapper.style.display = 'block';
        searchBox.focus(); // Automatically put cursor in the box
        event.stopPropagation();
    });

    // 2. Run search when typing
    searchBox.addEventListener('input', function () {
        const query = this.value.toLowerCase();
        displaySearchResults(query);
    });

    // 3. Close search if clicked anywhere outside the search container
    document.addEventListener('click', function (event) {
        if (!searchContainer.contains(event.target)) {
            searchWrapper.style.display = 'none';
            searchResults.style.display = 'none';
            searchIconBtn.style.display = 'flex';
        }
    });
});

document.getElementById('expand-btn').addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    expandTree();
});

document.getElementById('collapse-btn').addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    collapseTree();
});

document.getElementById('center-btn').addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    centerParentNode();
});
document.getElementById('zoom-in-btn').addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation(); // This prevents the click from triggering the search
    zoomIn();
});

document.getElementById('zoom-out-btn').addEventListener('click', function(event) {
    event.preventDefault();
    event.stopPropagation(); // This prevents the click from triggering the search
    zoomOut();
});
update(root);

// === Smooth UI Hide/Show on Scroll ===
// === Smooth UI Hide/Show on Scroll ===
const uiWrapper = document.getElementById('ui-wrapper');
const treeContainerElement = document.getElementById('tree-container');

// === Refined UI Hide/Show on Scroll ===
treeContainerElement.addEventListener('scroll', () => {
    const scrollTop = treeContainerElement.scrollTop;
    const scrollHeight = treeContainerElement.scrollHeight;
    const clientHeight = treeContainerElement.clientHeight;

    // 1. If we scroll down, hide the UI immediately
    if (scrollTop > 50) {
        uiWrapper.classList.add('hidden');
    } 
    // 2. Only show the logo if we are at the very top AND 
    // the tree is actually long enough to require scrolling.
    else if (scrollTop <= 5) {
        if (scrollHeight > clientHeight + 100) {
            uiWrapper.classList.remove('hidden');
        }
    }
});

// Force the view to the very top on initial load so the logo is fully visible
// Force the view to the very top and perfectly center the root node on load
setTimeout(() => {
    // 1. Find the exact horizontal pixel of the root node
    const horizontalOffset = isMobile() ? initialHorizontalForMobile : initialHorizontalOffset;
    const rootX = currentAdjustment + (root.x + horizontalOffset) * zoomLevel;
    
    // 2. Scroll the container so the root node aligns perfectly in the middle of the screen
    treeContainerElement.scrollLeft = rootX - (treeContainerElement.clientWidth / 2);
    treeContainerElement.scrollTop = 0;
}, 100);

// === Keep Tree Perfectly Centered on Window Resize ===
window.addEventListener('resize', () => {
    const treeContainer = document.getElementById('tree-container');
    
    // 1. Capture the exact pixel currently in the center of the screen
    const centerX = treeContainer.scrollLeft + (treeContainer.clientWidth / 2);
    const centerY = treeContainer.scrollTop + (treeContainer.clientHeight / 2);
    
    // 2. Map this screen center back to the unscaled inner tree coordinates
    const innerX = (centerX - currentAdjustment) / zoomLevel;
    const innerY = (centerY - 230) / zoomLevel;
    
    // 3. Update the SVG layout and dimensions to match the new window size
    update(root, false);
    
    // 4. Map the inner coordinates back to the new screen pixels 
    // (currentAdjustment might have changed during update!)
    const newCenterX = currentAdjustment + (innerX * zoomLevel);
    const newCenterY = 230 + (innerY * zoomLevel);
    
    // 5. Scroll to lock that exact pixel back into the center
    treeContainer.scrollLeft = newCenterX - (treeContainer.clientWidth / 2);
    treeContainer.scrollTop = newCenterY - (treeContainer.clientHeight / 2);
});