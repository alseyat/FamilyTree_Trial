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

const overlay = document.getElementById('header-overlay');
let initialVerticalOffset = (overlay ? overlay.offsetHeight : 0) + 40;
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
.style('fill', d => {
    const isDead = d.data.deceased
        || d.data.death !== undefined
        || d.data.portrait;
    if (isDead) return d._children ? "#c3baa2" : "#c3baa2";
    return d._children ? "#f8edcf" : "#f8edcf";
});

    nodeEnter.append('text')
        .attr('dy', '.23em')
        .attr('x', 0)
        .attr('text-anchor', 'middle')
        .attr("font-family", 'Noto Naskh Arabic, sans-serif')
        .attr("font-size", "20px")
        .text(d => d.data.name);

    // Death badge — circle + ❖ symbol, with pulse animation, only for nodes with a death date or portrait
    const deathBadge = nodeEnter.append('g')
        .attr('class', 'death-badge')
        .attr('transform', 'translate(44, -16)')
        .style('cursor', 'pointer')
        .style('display', d => (d.data.death !== undefined && d.data.death !== null) || d.data.portrait ? null : 'none')
        .on('click', function(event, d) {
            event.stopPropagation();
            openDeathPopup(d);
        });

    // Pulsing ring — uses SVG <animate> so it works without CSS r animation
    const pulseCircle = deathBadge.append('circle')
        .attr('r', 8)
        .attr('fill', 'none')
        .attr('stroke', '#8b6914')
        .attr('stroke-width', '2');

    pulseCircle.append('animate')
        .attr('attributeName', 'r')
        .attr('from', '8')
        .attr('to', '16')
        .attr('dur', '2s')
        .attr('repeatCount', 'indefinite');

    pulseCircle.append('animate')
        .attr('attributeName', 'opacity')
        .attr('from', '0.7')
        .attr('to', '0')
        .attr('dur', '2s')
        .attr('repeatCount', 'indefinite');

    // Filled circle background
    deathBadge.append('circle')
        .attr('r', 8)
        .attr('fill', '#8b6914')
        .attr('stroke', '#fff')
        .attr('stroke-width', '1.5');

    // ❖ symbol on top
    deathBadge.append('text')
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '9px')
        .attr('fill', '#fff')
        .attr('pointer-events', 'none')
        .text('❖');

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
.style('fill', d => {
    const isDead = d.data.deceased
        || d.data.death !== undefined
        || d.data.portrait;
    if (isDead) return d._children ? "#c3baa2" : "#c3baa2";
    return d._children ? "#f8edcf" : "#f8edcf";
});

    nodeUpdate.select('.children-badge circle')
        .style('fill', d => d._children ? "#ea5050" : "#95a5a6");

    nodeUpdate.select('.death-badge')
        .style('display', d => (d.data.death !== undefined && d.data.death !== null) || d.data.portrait ? null : 'none');

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
                duration = 150;  // ← instant collapse only

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
                duration = 150;  // ← restore to your default


        // Calculate new position using the updated currentAdjustment and new d.x
        const newX = currentAdjustment + (d.x + horizontalOffset) * zoomLevel;
        const newY = 230 + (d.y + initialVerticalOffset) * zoomLevel;

        const treeContainer = document.getElementById('tree-container');
        treeContainer.scrollLeft += (newX - oldX);
        treeContainer.scrollTop += (newY - oldY);
    }
}

// ── Death Date Popup ─────────────────────────────────────
function openDeathPopup(d) {
    const hasPortrait = !!d.data.portrait;
    const hasDeath = d.data.death !== undefined && d.data.death !== null;
    const hasDate = hasDeath && d.data.death !== '';

    function showPopup() {
        // Name
        document.getElementById('death-popup-name').textContent = getFullName(d);

        // Rahma — hide only if person has a portrait but no death info
        const rahmaEl = document.getElementById('death-popup-rahma');
        rahmaEl.style.display = (hasPortrait && !hasDeath) ? 'none' : 'block';

        // Date — show only if there's an actual date string
        const dateEl = document.getElementById('death-popup-date');
        if (hasDate) {
    const parts = d.data.death.split(' - ');
    const hijri = parts[0] || '';
    const miladi = parts[1] || '';

    dateEl.innerHTML = `
        <span id="death-popup-label">الوفاة:</span>
        <span class="death-date-parts">
            <span class="death-date-hijri">${hijri}</span>
            ${miladi ? `<span class="death-date-sep"> - </span><span class="death-date-miladi">${miladi}</span>` : ''}
        </span>`;
    dateEl.style.display = 'flex';
} else {
            dateEl.innerHTML = '';
            dateEl.style.display = 'none';
        }

        document.getElementById('death-popup').classList.add('open');
        document.getElementById('death-popup-overlay').classList.add('open');
    }

    // Portrait — load first, then open popup so everything appears together
    const portraitEl = document.getElementById('death-popup-portrait');
    portraitEl.style.display = 'none';
    portraitEl.src = '';

    if (hasPortrait) {
        const img = new Image();
        img.onload = () => {
            portraitEl.src = img.src;
            portraitEl.style.display = 'block';
            showPopup();
        };
        img.onerror = () => {
            portraitEl.style.display = 'none';
            showPopup();
        };
        img.src = `assets/${d.data.portrait}.jpg`;
    } else {
        showPopup();
    }
}

function closeDeathPopup() {
    document.getElementById('death-popup').classList.remove('open');
    document.getElementById('death-popup-overlay').classList.remove('open');
}

// Close handlers — inside script.js (module scope) so they always resolve correctly
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('death-popup-close').addEventListener('click', closeDeathPopup);
    document.getElementById('death-popup-overlay').addEventListener('click', closeDeathPopup);
});

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

    // 2b. Navigate to results page on Enter
    searchBox.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            if (query.length > 0) {
                window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
            }
        }
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

// === Auto-focus from URL param (coming back from search-results.html) ===
(function () {
    const params = new URLSearchParams(window.location.search);
    const focusName = params.get('focus');
    if (focusName) {
        // Wait for tree to render before focusing
        setTimeout(() => {
            focusOnNodeFromSearch(decodeURIComponent(focusName));
        }, 300);
    }
})();

// === Smooth UI Hide/Show on Scroll ===
// === Smooth UI Hide/Show on Scroll ===
const uiWrapper = document.getElementById('ui-wrapper');
const treeContainerElement = document.getElementById('tree-container');
const headerOverlay = document.getElementById('header-overlay');

// === Refined UI Hide/Show on Scroll ===
treeContainerElement.addEventListener('scroll', () => {
    const scrollTop = treeContainerElement.scrollTop;
    const scrollHeight = treeContainerElement.scrollHeight;
    const clientHeight = treeContainerElement.clientHeight;

    // 1. If we scroll down, hide the UI immediately
    if (scrollTop > 50) {
        uiWrapper.classList.add('hidden');
        if (headerOverlay) headerOverlay.classList.add('hidden');
    } 
    // 2. Only show the logo if we are at the very top AND 
    // the tree is actually long enough to require scrolling.
    else if (scrollTop <= 5) {
        if (scrollHeight > clientHeight + 100) {
            uiWrapper.classList.remove('hidden');
            if (headerOverlay) headerOverlay.classList.remove('hidden');
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

// === Pinch-to-Zoom (Mobile Two-Finger Gesture) ===
(function () {
    const treeContainer = document.getElementById('tree-container');

    let pinchStartDist = null;
    let pinchStartZoom = null;
    let lastAppliedZoom = null;

    function getTouchDist(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.hypot(dx, dy);
    }

    treeContainer.addEventListener('touchstart', function (e) {
        if (e.touches.length === 2) {
            pinchStartDist = getTouchDist(e.touches);
            pinchStartZoom = zoomLevel;
            lastAppliedZoom = zoomLevel;
        }
    }, { passive: true });

    treeContainer.addEventListener('touchmove', function (e) {
        if (e.touches.length !== 2 || pinchStartDist === null) return;
        e.preventDefault();

        const currentDist = getTouchDist(e.touches);
        const rawScale = currentDist / pinchStartDist;
        const newZoom = Math.min(1, Math.max(0.2, pinchStartZoom * rawScale));

        if (Math.abs(newZoom - lastAppliedZoom) < 0.005) return;

        lastAppliedZoom = newZoom;
        applyZoom(newZoom);

    }, { passive: false });

    treeContainer.addEventListener('touchend', function (e) {
        if (e.touches.length < 2) {
            pinchStartDist = null;
            pinchStartZoom = null;
            lastAppliedZoom = null;
        }
    }, { passive: true });
})();

// ── PNG Export (called from inline script via window.exportTree) ──────────────
window.exportTree = async function (onDone) {

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Safari blocks window.open() after any await — must open tab SYNCHRONOUSLY
    // before any async work, then fill it with the image later
    let safariTab = null;
    if (isMobile && isSafari) {
        safariTab = window.open("", "_blank");
        if (safariTab) {
            safariTab.document.write(
                '<html><head>' +
                '<meta name="viewport" content="width=device-width,initial-scale=1">' +
                '<title>شجرة أسرة السياط</title>' +
                '<style>body{margin:0;background:#1a1a1a;display:flex;flex-direction:column;' +
                'align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;}' +
                'p{color:#aaa;font-size:16px;margin-top:16px;direction:rtl;}' +
                '</style></head>' +
                '<body><p>جارٍ تجهيز الصورة...</p></body></html>'
            );
        }
    }

    const originalDuration = duration;

    // 1. Expand everything instantly
    duration = 0;
    expandAll(root);
    update(root);
    duration = originalDuration;

    // 2. Wait two frames for D3 layout to settle
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const svgEl     = document.querySelector("#tree-container svg");
    const svgWidth  = parseFloat(svgEl.getAttribute("width"));
    const svgHeight = parseFloat(svgEl.getAttribute("height"));

    // 3. Fetch Arabic font → base64 so canvas stays untainted
    let fontFaceCSS = "";
    try {
        const fontRes = await fetch("https://fonts.gstatic.com/s/notonaskharabic/v35/RrQ5bpV-9Dd1b1OAGA6M9PkyDuVBePeKNaxcsss0Y7bwvc-tTLqHIhqQHqY.woff2");
        const fontBuf = await fontRes.arrayBuffer();
        const base64  = btoa(String.fromCharCode(...new Uint8Array(fontBuf)));
        fontFaceCSS   = `@font-face {
            font-family: 'NotoArabic';
            src: url('data:font/woff2;base64,${base64}') format('woff2');
        }`;
    } catch (_) {}

    // 4. Clone SVG
    const clone = svgEl.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width",  svgWidth);
    clone.setAttribute("height", svgHeight);

    // 5. Inject self-contained styles with embedded font
    const styleEl = document.createElementNS("http://www.w3.org/2000/svg", "style");
    styleEl.textContent = `
        ${fontFaceCSS}
        .node rect               { fill: #ffffff; stroke: #2c3e50; stroke-width: 3px; }
        .node.has-children rect  { fill: #e8f0f2; }
        .node.collapsed rect     { fill: rgb(194,194,205); }
        .node text               { font-family: 'NotoArabic', serif; font-size: 20px; fill: #000; }
        .link                    { fill: none; stroke: #747a7a; stroke-width: 2.5px; }
        .children-badge circle   { fill: #ea5050; stroke: #fff; stroke-width: 2px; }
        .children-badge text     { fill: #fff; font-size: 11px; font-weight: bold;
                                   font-family: 'NotoArabic', serif; }
        .death-badge circle      { fill: #8b6914; stroke: #fff; stroke-width: 1.5px; }
        .death-badge text        { fill: #fff; font-size: 9px; }
    `;
    clone.insertBefore(styleEl, clone.firstChild);

    // 6. Warm background rect
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    bg.setAttribute("width",  svgWidth);
    bg.setAttribute("height", svgHeight);
    bg.setAttribute("fill", "#f4efdf");
    clone.insertBefore(bg, styleEl.nextSibling);

    // 7. Serialize SVG → Blob → Object URL
    const svgStr = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl  = URL.createObjectURL(svgBlob);

    // Helper: restore tree state
    function restoreTree() {
        duration = 0;
        collapseAll(root);
        if (root._children) {
            root.children  = root._children;
            root._children = null;
        }
        update(root);
        duration = originalDuration;
    }

    // 8. Render SVG → canvas → PNG data URL
    const scale  = 2;
    const canvas = document.createElement("canvas");
    canvas.width  = svgWidth  * scale;
    canvas.height = svgHeight * scale;
    const ctx = canvas.getContext("2d");
    ctx.scale(scale, scale);

    const img = new Image();
    img.onload = function () {
        ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
        URL.revokeObjectURL(svgUrl);

        const dataURL = canvas.toDataURL("image/png");

        if (isMobile && isSafari && safariTab) {
            // 9a. Safari iOS: write PNG into the pre-opened tab
            //     User long-presses image → "Add to Photos"
            safariTab.document.open();
            safariTab.document.write(
                '<html><head>' +
                '<meta name="viewport" content="width=device-width,initial-scale=1">' +
                '<title>شجرة أسرة السياط</title>' +
                '<style>body{margin:0;background:#1a1a1a;display:flex;flex-direction:column;' +
                'align-items:center;padding:16px;box-sizing:border-box;}' +
                'img{max-width:100%;height:auto;border-radius:8px;}' +
                'p{color:#ccc;font-size:14px;margin-top:12px;direction:rtl;text-align:center;}' +
                '</style></head>' +
                '<body>' +
                '<img src="' + dataURL + '">' +
                '<p>اضغط مطوّلاً على الصورة ثم اختر "إضافة إلى الصور"</p>' +
                '</body></html>'
            );
            safariTab.document.close();
        } else if (isMobile) {
            // 9b. Chrome iOS / Android: anchor click works
            const a = document.createElement("a");
            a.download = "شجرة-أسرة-السياط.png";
            a.href = dataURL;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            // 9c. Desktop: standard anchor download
            const a = document.createElement("a");
            a.download = "شجرة-أسرة-السياط.png";
            a.href = dataURL;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        restoreTree();
        onDone();
    };
    img.onerror = function () {
        URL.revokeObjectURL(svgUrl);
        if (safariTab) safariTab.close();
        alert("تعذّر تصدير الصورة.");
        restoreTree();
        onDone();
    };
    img.src = svgUrl;
};