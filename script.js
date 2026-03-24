import data from './alseyat.js';

// =========================================
//  Portrait image loader (case-insensitive)
// =========================================
/** Try common image extensions for a portrait path (without extension).
 *  Calls back with the working src, or null if none matched. */
// =========================================
//  Constants & Layout Config
// =========================================
const BREAKPOINT = 768;
const VERTICAL_CANVAS_PAD = 10;
const HIGHLIGHT_INTERVAL = 400;
const HIGHLIGHT_FLASHES = 3;
const DEFAULT_DURATION = 150;
const DEPTH_SPACING = 80;
const LINK_ELBOW_OFFSET = 45;

const margin = { top: 200, right: 20, bottom: 20, left: 300 };
let width = 1200, height = 2000;
let i = 0, duration = DEFAULT_DURATION, delay = 50;
let zoomLevel = 1;
let currentAdjustment = 0;

// =========================================
//  Helper Functions
// =========================================

/** Is the viewport at mobile width? */
function isMobile() {
    return window.innerWidth <= BREAKPOINT;
}

/** Get the correct horizontal offset for the current viewport */
function getHOffset() {
    return isMobile() ? initialHorizontalForMobile : initialHorizontalOffset;
}

/** Determine node fill color based on deceased status */
function getNodeFill(d) {
    const isDead = d.data.deceased || d.data.death !== undefined;
    return isDead ? '#c3baa2' : '#f8edcf';
}

/** Does this node have death info worth showing? (death property exists, even if empty string) */
function hasDeathInfo(d) {
    return d.data.death !== undefined && d.data.death !== null;
}

/** Is this person alive and has a portrait? */
function isAliveWithPortrait(d) {
    return !!d.data.portrait && (d.data.death === undefined || d.data.death === null);
}

/** Build a transform string for a node position */
function nodeTransform(x, y) {
    return `translate(${x + getHOffset()},${y + initialVerticalOffset})`;
}

/** Build an L-shaped link path from parent (px,py) to child (cx,cy) */
function linkPath(px, py, cx, cy, withElbow) {
    const h = getHOffset();
    const vy = withElbow ? py + LINK_ELBOW_OFFSET + initialVerticalOffset : py + initialVerticalOffset;
    return `M${px + h},${py + initialVerticalOffset}V${vy}H${cx + h}V${cy + initialVerticalOffset}`;
}

/** Flash highlight on rect+text elements N times */
function flashHighlight(rectEl, textEl, times, interval) {
    for (let step = 0; step < times * 2; step++) {
        setTimeout(() => {
            const action = step % 2 === 0 ? 'add' : 'remove';
            rectEl.classList[action]('highlight');
            textEl.classList[action]('highlight');
        }, interval * step);
    }
    // Final cleanup — ensure highlight is removed
    setTimeout(() => {
        rectEl.classList.remove('highlight');
        textEl.classList.remove('highlight');
    }, interval * times * 2);
}

/** Bind a button click with preventDefault + stopPropagation */
function bindButton(id, handler) {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            handler(e);
        });
    }
}

// =========================================
//  D3 Tree Setup
// =========================================
const svg = d3.select('#tree-container').append('svg')
    .attr('width', width)
    .attr('height', height);

const svgGroup = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

const tree = d3.tree().nodeSize([120, 50])
    .separation((a, b) => a.parent === b.parent ? 1 : 1.25);

let root = d3.hierarchy(data);
root.x0 = width / 2;
root.y0 = 0;

const overlay = document.getElementById('header-overlay');
let initialVerticalOffset = (overlay ? overlay.offsetHeight : 0) + 40;
let initialHorizontalOffset = width / 2 + 19;
let initialHorizontalForMobile = 79;

// =========================================
//  Tree Name Utility
// =========================================
function getFullName(d) {
    const names = [];
    let current = d;
    while (current) {
        names.push(current.data.name);
        current = current.parent;
    }
    return names.join(' بن ');
}

// =========================================
//  Collapse / Expand
// =========================================
function reverseChildren(node) {
    if (node.children) {
        node.children.reverse();
        node.children.forEach(reverseChildren);
    }
}

function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

function expandNode(node) {
    if (!node.children && node._children) {
        node.children = node._children;
        node._children = null;
    }
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
    if (d.children) {
        d.children.forEach(expandAll);
    }
}

reverseChildren(root);
collapse(root);

// =========================================
//  Core Update Function
// =========================================
function update(source, center = false) {
    const treeData = tree(root);
    const nodes = treeData.descendants();
    const links = treeData.descendants().slice(1);

    nodes.forEach(d => d.y = d.depth * DEPTH_SPACING);

    const minX = Math.min(...nodes.map(d => d.x));
    const maxX = Math.max(...nodes.map(d => d.x));
    const maxY = Math.max(...nodes.map(d => d.y));
    const hOffset = getHOffset();

    // Prevent left-side clipping
    let baseAdjustment = Math.max(0, 100 - (minX + hOffset) * zoomLevel);

    // Center small trees
    const rootXPosition = baseAdjustment + (root.x + hOffset) * zoomLevel;
    const treeContainer = document.getElementById('tree-container');
    const halfContainerWidth = treeContainer.clientWidth / 2;
    if (rootXPosition < halfContainerWidth) {
        baseAdjustment += (halfContainerWidth - rootXPosition);
    }

    currentAdjustment = baseAdjustment;

    const requiredWidth = currentAdjustment + (maxX + hOffset) * zoomLevel + 300;
    const requiredHeight = 230 + (maxY + initialVerticalOffset) * zoomLevel + 400;

    svgGroup.attr('transform', `translate(${currentAdjustment}, ${VERTICAL_CANVAS_PAD}) scale(${zoomLevel})`);

    d3.select('#tree-container svg')
        .attr('width', Math.max(window.innerWidth, requiredWidth))
        .attr('height', Math.max(window.innerHeight, requiredHeight));

    // ── Nodes ──
    const node = svgGroup.selectAll('g.node')
        .data(nodes, d => d.id || (d.id = ++i));

    const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr('transform', () => nodeTransform(source.x, source.y0))
        .attr('data-id', d => d.id)
        .on('click', click);

    nodeEnter.append('rect')
        .attr('width', 100).attr('height', 40)
        .attr('x', -50).attr('y', -15)
        .attr('rx', 10).attr('ry', 10)
        .attr('class', 'node')
        .style('fill', d => getNodeFill(d));

    nodeEnter.append('text')
        .attr('dy', '.23em')
        .attr('x', 0)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Noto Naskh Arabic, sans-serif')
        .attr('font-size', '20px')
        .text(d => d.data.name);

    // Death badge (pulse + icon)
    const deathBadge = nodeEnter.append('g')
        .attr('class', 'death-badge')
        .attr('transform', 'translate(44, -16)')
        .style('cursor', 'pointer')
        .style('display', d => hasDeathInfo(d) ? null : 'none')
        .on('click', function (event, d) {
            event.stopPropagation();
            openDeathPopup(d);
        });

    const pulseCircle = deathBadge.append('circle')
        .attr('r', 8).attr('fill', 'none')
        .attr('stroke', '#8b6914').attr('stroke-width', '2');

    pulseCircle.append('animate')
        .attr('attributeName', 'r').attr('from', '8').attr('to', '16')
        .attr('dur', '2s').attr('repeatCount', 'indefinite');
    pulseCircle.append('animate')
        .attr('attributeName', 'opacity').attr('from', '0.7').attr('to', '0')
        .attr('dur', '2s').attr('repeatCount', 'indefinite');

    deathBadge.append('circle')
        .attr('r', 8).attr('fill', '#8b6914')
        .attr('stroke', '#fff').attr('stroke-width', '1.5');
    deathBadge.append('text')
        .attr('dy', '0.35em').attr('text-anchor', 'middle')
        .attr('font-size', '9px').attr('fill', '#fff')
        .attr('pointer-events', 'none').text('❖');

    // Portrait badge (top-left, static — no glow)
    const portraitBadge = nodeEnter.append('g')
        .attr('class', 'portrait-badge')
        .attr('transform', 'translate(-44, -16)')
        .style('cursor', 'pointer')
        .style('display', d => isAliveWithPortrait(d) ? null : 'none')
        .on('click', function (event, d) {
            event.stopPropagation();
            openPortraitPopup(d);
        });

    portraitBadge.append('circle')
        .attr('r', 8)
        .attr('fill', '#6b8e6b')
        .attr('stroke', '#fff')
        .attr('stroke-width', '1.5');
    // Person silhouette: head + shoulders
    portraitBadge.append('circle')
        .attr('cx', 0).attr('cy', -2.5).attr('r', 2.8)
        .attr('fill', '#fff').attr('stroke', 'none');
    portraitBadge.append('path')
        .attr('d', 'M-4,4.5 Q-4,0.5 0,0.5 Q4,0.5 4,4.5')
        .attr('fill', '#fff').attr('stroke', 'none');

    // ── Update portrait badge visibility on re-render ──
    // (handled below in nodeUpdate section)

    // Children count badge
    const badge = nodeEnter.append('g')
        .attr('class', 'children-badge')
        .attr('transform', 'translate(0, 24)')
        .style('display', d => (d.children || d._children) ? null : 'none');

    badge.append('circle')
        .attr('r', 10)
        .style('fill', '#ea5050').style('stroke', '#fff').style('stroke-width', '2px');
    badge.append('text')
        .attr('dy', '0.35em').attr('text-anchor', 'middle')
        .attr('font-family', 'Noto Naskh Arabic, sans-serif')
        .attr('font-size', '11px').attr('font-weight', 'bold')
        .style('fill', '#fff')
        .text(d => d.children ? d.children.length : (d._children ? d._children.length : ''));

    // ── Update existing nodes ──
    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition()
        .duration(d => d.depth === 0 ? 0 : duration)
        .attr('transform', d => nodeTransform(d.x, d.y));

    nodeUpdate.select('rect')
        .attr('width', 100).attr('height', 40)
        .attr('x', -50).attr('y', -20)
        .attr('rx', 10).attr('ry', 10)
        .attr('class', d => d._children ? 'has-children' : '')
        .style('fill', d => getNodeFill(d));

    nodeUpdate.select('.children-badge circle')
        .style('fill', d => d._children ? '#ea5050' : '#95a5a6');
    nodeUpdate.select('.death-badge')
        .style('display', d => hasDeathInfo(d) ? null : 'none');
    nodeUpdate.select('.portrait-badge')
        .style('display', d => isAliveWithPortrait(d) ? null : 'none');

    // ── Exit nodes ──
    node.exit().transition()
        .duration(duration)
        .attr('transform', () => nodeTransform(source.x, source.y))
        .remove()
        .select('rect')
        .attr('width', 100).attr('height', 30)
        .attr('x', -50).attr('y', -15)
        .attr('rx', 10).attr('ry', 10);

    // ── Links ──
    const link = svgGroup.selectAll('path.link')
        .data(links, d => d.id);

    link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', () => linkPath(source.x, source.y, source.x, source.y, false))
        .merge(link)
        .transition().duration(duration)
        .attr('d', d => linkPath(d.parent.x, d.parent.y, d.x, d.y, true));

    link.exit()
        .attr('d', () => linkPath(source.x, source.y, source.x, source.y, false))
        .remove();

    // Store positions for next transition
    nodes.forEach(d => { d.x0 = d.x; d.y0 = d.y; });

    if (center) centerTopNode();
}

// =========================================
//  Click Handler
// =========================================
function click(event, d) {
    let hasChanges = false;

    if (d.children) {
        d._children = d.children.concat(d._children || []);
        d.children = null;
        hasChanges = true;
        duration = DEFAULT_DURATION;
    } else if (d._children) {
        d.children = d._children;
        d._children = null;
        hasChanges = true;
        // Collapse grandchildren on expand
        d.children.forEach(child => {
            if (child.children) {
                child._children = child.children;
                child.children = null;
            }
        });
    }

    if (hasChanges) {
        const hOffset = getHOffset();
        const oldAdjustment = currentAdjustment;
        const oldX = oldAdjustment + (d.x0 + hOffset) * zoomLevel;
        const oldY = 230 + (d.y0 + initialVerticalOffset) * zoomLevel;

        update(d);
        duration = DEFAULT_DURATION;

        const newX = currentAdjustment + (d.x + hOffset) * zoomLevel;
        const newY = 230 + (d.y + initialVerticalOffset) * zoomLevel;

        const treeContainer = document.getElementById('tree-container');
        treeContainer.scrollLeft += (newX - oldX);
        treeContainer.scrollTop += (newY - oldY);
    }
}

// =========================================
//  Portrait Loading Indicator
// =========================================
function showLoading() {
    document.getElementById('portrait-loading').classList.add('show');
}
function hideLoading() {
    document.getElementById('portrait-loading').classList.remove('show');
}

// =========================================
//  Death Date Popup
// =========================================
function openDeathPopup(d) {
    const hasPortrait = !!d.data.portrait;
    const hasDeath = d.data.death !== undefined && d.data.death !== null;
    const hasDate = hasDeath && d.data.death !== '';

    function showPopup() {
        document.getElementById('death-popup-name').textContent = getFullName(d);

        const rahmaEl = document.getElementById('death-popup-rahma');
        rahmaEl.style.display = (hasPortrait && !hasDeath) ? 'none' : 'block';

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

    // Load portrait first so popup appears fully formed
    const portraitEl = document.getElementById('death-popup-portrait');
    portraitEl.style.display = 'none';
    portraitEl.src = '';

    if (hasPortrait) {
        showLoading();
        const img = new Image();
        img.onload = () => {
            portraitEl.src = img.src;
            portraitEl.style.display = 'block';
            hideLoading();
            showPopup();
        };
        img.onerror = () => {
            hideLoading();
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

// =========================================
//  Alive Portrait Popup
// =========================================
function openPortraitPopup(d) {
    const imgEl = document.getElementById('portrait-popup-img');
    imgEl.style.display = 'none';
    imgEl.src = '';
    document.getElementById('portrait-popup-name').textContent = getFullName(d);

    showLoading();
    const img = new Image();
    img.onload = () => {
        imgEl.src = img.src;
        imgEl.style.display = 'block';
        hideLoading();
        document.getElementById('portrait-popup').classList.add('open');
        document.getElementById('portrait-popup-overlay').classList.add('open');
    };
    img.onerror = () => {
        hideLoading();
        document.getElementById('portrait-popup').classList.add('open');
        document.getElementById('portrait-popup-overlay').classList.add('open');
    };
    img.src = `assets/${d.data.portrait}.jpg`;
}

function closePortraitPopup() {
    document.getElementById('portrait-popup').classList.remove('open');
    document.getElementById('portrait-popup-overlay').classList.remove('open');
}

// =========================================
//  Portrait Lightbox
// =========================================
function openLightbox(src, alt) {
    const lightbox = document.getElementById('portrait-lightbox');
    const img = document.getElementById('lightbox-img');
    img.src = src;
    img.alt = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('portrait-lightbox');
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    document.getElementById('lightbox-img').src = '';
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('death-popup-close').addEventListener('click', closeDeathPopup);
    document.getElementById('death-popup-overlay').addEventListener('click', closeDeathPopup);

    // Lightbox: click portrait in death popup to open full-size
    document.getElementById('death-popup-portrait').addEventListener('click', function () {
        if (this.src && this.style.display !== 'none') {
            openLightbox(this.src, this.alt);
        }
    });

    // Alive portrait popup
    document.getElementById('portrait-popup-close').addEventListener('click', closePortraitPopup);
    document.getElementById('portrait-popup-overlay').addEventListener('click', closePortraitPopup);
    document.getElementById('portrait-popup-img').addEventListener('click', function () {
        if (this.src && this.style.display !== 'none') {
            openLightbox(this.src, this.alt);
        }
    });

    // Lightbox: close on background click, close button, or Escape
    document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
    document.getElementById('portrait-lightbox').addEventListener('click', function (e) {
        if (e.target === this) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            const lightbox = document.getElementById('portrait-lightbox');
            if (lightbox.classList.contains('open')) closeLightbox();
        }
    });
});

// =========================================
//  Search
// =========================================
function searchTreeNames(node, query, fullName = '', matches = []) {
    const currentFullName = fullName ? `${node.name} بن ${fullName}` : node.name;
    if (currentFullName.toLowerCase().startsWith(query)) {
        matches.push(currentFullName);
    }
    if (node.children) {
        node.children.forEach(child => searchTreeNames(child, query, currentFullName, matches));
    }
    return matches;
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
            document.getElementById('search-results').style.display = 'none';
            document.getElementById('search-wrapper-floating').style.display = 'none';
            document.getElementById('search-icon-btn').style.display = 'flex';
            document.getElementById('search-box').value = '';
        });
        searchResults.appendChild(li);
    });
    searchResults.style.display = matchedNames.length ? 'block' : 'none';
}

function focusOnNodeFromSearch(fullName) {
    const nameParts = fullName.split(' بن ').reverse();
    let currentNode = root;
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

        const matchingChild = currentNode.children.find(child => child.data.name === nameParts[counter]);
        if (!matchingChild) return;

        currentNode = matchingChild;
        counter++;

        if (counter === nameParts.length) break;
        expandNode(currentNode);
        update(root);
    }

    setTimeout(() => centerNode(currentNode), delay);
}

// =========================================
//  Centering & Navigation
// =========================================
function centerNode(source) {
    const nodeElement = d3.select(`[data-id='${source.id}']`);
    const rectElement = nodeElement.select('rect').node();
    const textElement = nodeElement.select('text').node();
    const treeContainer = document.getElementById('tree-container');

    if (rectElement && textElement && treeContainer) {
        const nodeX = currentAdjustment + (source.x + getHOffset()) * zoomLevel;
        const nodeY = 230 + (source.y + initialVerticalOffset) * zoomLevel;

        treeContainer.scrollTo({
            left: nodeX - (treeContainer.clientWidth / 2),
            top: nodeY - (treeContainer.clientHeight / 2),
            behavior: 'smooth'
        });

        flashHighlight(rectElement, textElement, HIGHLIGHT_FLASHES, HIGHLIGHT_INTERVAL);
    }
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

function centerParentNode(isInstant = false) {
    const treeContainer = document.getElementById('tree-container');
    const nodeX = currentAdjustment + (root.x + getHOffset()) * zoomLevel;
    const nodeY = 230 + (root.y + initialVerticalOffset) * zoomLevel;
    treeContainer.scrollTo({
        left: nodeX - (treeContainer.clientWidth / 2),
        top: nodeY - (treeContainer.clientHeight / 2),
        behavior: isInstant ? 'auto' : 'smooth'
    });
}

// =========================================
//  Expand / Collapse Tree
// =========================================
function expandTree() {
    const saved = duration;
    duration = 0;
    expandAll(root);
    update(root);
    centerParentNode(true);
    duration = saved;
}

function collapseTree() {
    const saved = duration;
    duration = 0;
    collapseAll(root);
    update(root);
    centerParentNode(true);
    duration = saved;
}

// =========================================
//  Zoom
// =========================================
function applyZoom(newZoom) {
    const treeContainer = document.getElementById('tree-container');
    const centerX = treeContainer.scrollLeft + (treeContainer.clientWidth / 2);
    const centerY = treeContainer.scrollTop + (treeContainer.clientHeight / 2);
    const innerX = (centerX - currentAdjustment) / zoomLevel;
    const innerY = (centerY - 230) / zoomLevel;

    zoomLevel = newZoom;
    update(root, false);

    const newCenterX = currentAdjustment + (innerX * zoomLevel);
    const newCenterY = 230 + (innerY * zoomLevel);
    treeContainer.scrollLeft = newCenterX - (treeContainer.clientWidth / 2);
    treeContainer.scrollTop = newCenterY - (treeContainer.clientHeight / 2);
}

function zoomIn() {
    const newZoom = Math.min(zoomLevel + 0.1, 1);
    if (newZoom !== zoomLevel) applyZoom(newZoom);
}

function zoomOut() {
    const newZoom = Math.max(zoomLevel - 0.1, 0.2);
    if (newZoom !== zoomLevel) applyZoom(newZoom);
}

// =========================================
//  Event Bindings
// =========================================
document.addEventListener('DOMContentLoaded', function () {
    const searchIconBtn = document.getElementById('search-icon-btn');
    const searchWrapper = document.getElementById('search-wrapper-floating');
    const searchBox = document.getElementById('search-box');
    const searchResults = document.getElementById('search-results');
    const searchContainer = document.getElementById('floating-search-container');

    searchIconBtn.addEventListener('click', function (event) {
        searchIconBtn.style.display = 'none';
        searchWrapper.style.display = 'block';
        searchBox.focus();
        event.stopPropagation();
    });

    searchBox.addEventListener('input', function () {
        displaySearchResults(this.value.toLowerCase());
    });

    searchBox.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            const query = this.value.trim();
            if (query.length > 0) {
                window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
            }
        }
    });

    document.addEventListener('click', function (event) {
        if (!searchContainer.contains(event.target)) {
            searchWrapper.style.display = 'none';
            searchResults.style.display = 'none';
            searchIconBtn.style.display = 'flex';
        }
    });
});

bindButton('expand-btn', expandTree);
bindButton('collapse-btn', collapseTree);
bindButton('center-btn', () => centerParentNode());
bindButton('zoom-in-btn', zoomIn);
bindButton('zoom-out-btn', zoomOut);

// Initial render
update(root);

// Auto-focus from URL param (e.g. from search-results.html or deceased.html)
(function () {
    const focusName = new URLSearchParams(window.location.search).get('focus');
    if (focusName) {
        setTimeout(() => focusOnNodeFromSearch(decodeURIComponent(focusName)), 300);
    }
})();

// =========================================
//  Scroll-based UI Hide/Show
// =========================================
const uiWrapper = document.getElementById('ui-wrapper');
const treeContainerElement = document.getElementById('tree-container');
const headerOverlay = document.getElementById('header-overlay');

treeContainerElement.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = treeContainerElement;

    if (scrollTop > 50) {
        uiWrapper.classList.add('hidden');
        if (headerOverlay) headerOverlay.classList.add('hidden');
    } else if (scrollTop <= 5 && scrollHeight > clientHeight + 100) {
        uiWrapper.classList.remove('hidden');
        if (headerOverlay) headerOverlay.classList.remove('hidden');
    }
});

// Center root node on initial load
setTimeout(() => {
    const rootX = currentAdjustment + (root.x + getHOffset()) * zoomLevel;
    treeContainerElement.scrollLeft = rootX - (treeContainerElement.clientWidth / 2);
    treeContainerElement.scrollTop = 0;
}, 100);

// Keep tree centered on resize
window.addEventListener('resize', () => {
    const tc = document.getElementById('tree-container');
    const centerX = tc.scrollLeft + (tc.clientWidth / 2);
    const centerY = tc.scrollTop + (tc.clientHeight / 2);
    const innerX = (centerX - currentAdjustment) / zoomLevel;
    const innerY = (centerY - 230) / zoomLevel;

    update(root, false);

    const newCenterX = currentAdjustment + (innerX * zoomLevel);
    const newCenterY = 230 + (innerY * zoomLevel);
    tc.scrollLeft = newCenterX - (tc.clientWidth / 2);
    tc.scrollTop = newCenterY - (tc.clientHeight / 2);
});

// =========================================
//  Pinch-to-Zoom (Mobile)
// =========================================
(function () {
    const tc = document.getElementById('tree-container');
    let pinchStartDist = null, pinchStartZoom = null, lastAppliedZoom = null;

    function getTouchDist(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.hypot(dx, dy);
    }

    tc.addEventListener('touchstart', e => {
        if (e.touches.length === 2) {
            pinchStartDist = getTouchDist(e.touches);
            pinchStartZoom = zoomLevel;
            lastAppliedZoom = zoomLevel;
        }
    }, { passive: true });

    tc.addEventListener('touchmove', e => {
        if (e.touches.length !== 2 || pinchStartDist === null) return;
        e.preventDefault();
        const newZoom = Math.min(1, Math.max(0.2, pinchStartZoom * (getTouchDist(e.touches) / pinchStartDist)));
        if (Math.abs(newZoom - lastAppliedZoom) < 0.005) return;
        lastAppliedZoom = newZoom;
        applyZoom(newZoom);
    }, { passive: false });

    tc.addEventListener('touchend', e => {
        if (e.touches.length < 2) {
            pinchStartDist = pinchStartZoom = lastAppliedZoom = null;
        }
    }, { passive: true });
})();

// =========================================
//  PNG Export
// =========================================
window.exportTree = async function (onDone) {
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    let safariTab = null;
    if (isMobileDevice && isSafariBrowser) {
        safariTab = window.open('', '_blank');
        if (safariTab) {
            safariTab.document.write(
                '<html><head><meta name="viewport" content="width=device-width,initial-scale=1">' +
                '<title>شجرة أسرة السياط</title>' +
                '<style>body{margin:0;background:#1a1a1a;display:flex;flex-direction:column;' +
                'align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;}' +
                'p{color:#aaa;font-size:16px;margin-top:16px;direction:rtl;}</style></head>' +
                '<body><p>جارٍ تجهيز الصورة...</p></body></html>'
            );
        }
    }

    const originalDuration = duration;
    duration = 0;
    expandAll(root);
    update(root);
    duration = originalDuration;

    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    const svgEl = document.querySelector('#tree-container svg');
    const svgWidth = parseFloat(svgEl.getAttribute('width'));
    const svgHeight = parseFloat(svgEl.getAttribute('height'));

    // Fetch Arabic font as base64 for untainted canvas
    let fontFaceCSS = '';
    try {
        const fontRes = await fetch('https://fonts.gstatic.com/s/notonaskharabic/v35/RrQ5bpV-9Dd1b1OAGA6M9PkyDuVBePeKNaxcsss0Y7bwvc-tTLqHIhqQHqY.woff2');
        const fontBuf = await fontRes.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(fontBuf)));
        fontFaceCSS = `@font-face { font-family:'NotoArabic'; src:url('data:font/woff2;base64,${base64}') format('woff2'); }`;
    } catch (_) { /* font embedding is optional */ }

    const clone = svgEl.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clone.setAttribute('width', svgWidth);
    clone.setAttribute('height', svgHeight);

    const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleEl.textContent = `
        ${fontFaceCSS}
        .node rect { fill:#ffffff; stroke:#2c3e50; stroke-width:3px; }
        .node.has-children rect { fill:#e8f0f2; }
        .node.collapsed rect { fill:rgb(194,194,205); }
        .node text { font-family:'NotoArabic',serif; font-size:20px; fill:#000; }
        .link { fill:none; stroke:#747a7a; stroke-width:2.5px; }
        .children-badge circle { fill:#ea5050; stroke:#fff; stroke-width:2px; }
        .children-badge text { fill:#fff; font-size:11px; font-weight:bold; font-family:'NotoArabic',serif; }
        .death-badge circle { fill:#8b6914; stroke:#fff; stroke-width:1.5px; }
        .death-badge text { fill:#fff; font-size:9px; }
    `;
    clone.insertBefore(styleEl, clone.firstChild);

    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', svgWidth);
    bg.setAttribute('height', svgHeight);
    bg.setAttribute('fill', '#f4efdf');
    clone.insertBefore(bg, styleEl.nextSibling);

    const svgStr = new XMLSerializer().serializeToString(clone);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    function restoreTree() {
        duration = 0;
        collapseAll(root);
        if (root._children) { root.children = root._children; root._children = null; }
        update(root);
        duration = originalDuration;
    }

    function downloadPNG(dataURL) {
        const a = document.createElement('a');
        a.download = 'شجرة-أسرة-السياط.png';
        a.href = dataURL;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = svgWidth * scale;
    canvas.height = svgHeight * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const img = new Image();
    img.onload = function () {
        ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
        URL.revokeObjectURL(svgUrl);
        const dataURL = canvas.toDataURL('image/png');

        if (isMobileDevice && isSafariBrowser && safariTab) {
            safariTab.document.open();
            safariTab.document.write(
                '<html><head><meta name="viewport" content="width=device-width,initial-scale=1">' +
                '<title>شجرة أسرة السياط</title>' +
                '<style>body{margin:0;background:#1a1a1a;display:flex;flex-direction:column;align-items:center;padding:16px;box-sizing:border-box;}' +
                'img{max-width:100%;height:auto;border-radius:8px;}p{color:#ccc;font-size:14px;margin-top:12px;direction:rtl;text-align:center;}</style></head>' +
                '<body><img src="' + dataURL + '"><p>اضغط مطوّلاً على الصورة ثم اختر "إضافة إلى الصور"</p></body></html>'
            );
            safariTab.document.close();
        } else {
            downloadPNG(dataURL);
        }

        restoreTree();
        onDone();
    };
    img.onerror = function () {
        URL.revokeObjectURL(svgUrl);
        if (safariTab) safariTab.close();
        alert('تعذّر تصدير الصورة.');
        restoreTree();
        onDone();
    };
    img.src = svgUrl;
};
