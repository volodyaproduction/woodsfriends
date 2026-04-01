/*
 * tree.js — builds the pixel tree
 *
 * What it does: creates all div elements of the tree
 *   (trunk, branches, leaves, lantern, roots)
 *   and appends them to the scene container.
 *
 * Called from: index.html after DOM is loaded.
 * Depends on: tree.css (classes .px, .trunk, etc.)
 *
 * Exports: buildTree(scene)
 *   scene — DOM element <div id="scene">
 */

function buildTree(scene) {

  // 1. Helper: creates a single pixel element
  function px(left, top, cls, parent) {
    var el = document.createElement('div');
    el.className = 'px ' + cls;
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    (parent || scene).appendChild(el);
    return el;
  }

  // 2. Trunk — lower part (3 pixels × 5 rows)
  for (var y = 400; y >= 336; y -= 16) {
    px(184, y, 'trunk');
    px(192, y, 'trunk-d');
    px(200, y, 'trunk');
  }

  // 3. Trunk — upper part (wider to connect with branches)
  px(184, 320, 'trunk');
  px(192, 320, 'trunk-d');
  px(200, 320, 'trunk');

  px(184, 304, 'trunk');
  px(192, 304, 'trunk-d');
  px(200, 304, 'trunk');

  px(192, 288, 'trunk-d');

  // 4. Branches (all connected to the trunk)
  var branches = [
    // Top right
    [208, 300], [224, 292],
    [240, 284], [256, 276],
    // Middle left (holds the lantern)
    [176, 324], [160, 328],
    [144, 332], [128, 336], [112, 340],
    // Bottom right
    [208, 348], [224, 344], [240, 340],
    // Top left
    [176, 300], [160, 292], [144, 284],
  ];
  branches.forEach(function(b) {
    px(b[0], b[1], 'branch');
  });

  // 5. Leaves — 4 groups, each swaying at its own speed (see tree.css)
  var leafGroups = [
    {
      cls: 'leaves-group',
      pixels: [
        [176, 260, 'leaf'],
        [192, 260, 'leaf-l'],
        [208, 260, 'leaf'],
        [160, 276, 'leaf-d'],
        [176, 276, 'leaf'],
        [192, 276, 'leaf-l'],
        [208, 276, 'leaf'],
        [224, 276, 'leaf-d'],
        [176, 244, 'leaf-l'],
        [192, 244, 'leaf'],
        [208, 244, 'leaf'],
        [192, 228, 'leaf-l'],
        [200, 232, 'leaf-d'],
      ]
    },
    {
      cls: 'leaves-group-2',
      pixels: [
        [248, 264, 'leaf'],
        [264, 264, 'leaf-l'],
        [256, 248, 'leaf'],
        [272, 256, 'leaf-d'],
        [240, 272, 'leaf'],
        [256, 272, 'leaf-l'],
        [272, 272, 'leaf'],
      ]
    },
    {
      cls: 'leaves-group-3',
      pixels: [
        [128, 268, 'leaf-d'],
        [144, 268, 'leaf'],
        [136, 252, 'leaf-l'],
        [152, 252, 'leaf'],
        [120, 280, 'leaf-d'],
        [136, 280, 'leaf'],
      ]
    },
    {
      cls: 'leaves-group',
      pixels: [
        [248, 332, 'leaf'],
        [264, 332, 'leaf-l'],
        [256, 320, 'leaf'],
        [240, 340, 'leaf-d'],
        [256, 340, 'leaf-l'],
      ]
    },
  ];

  leafGroups.forEach(function(group) {
    var container = document.createElement('div');
    container.className = group.cls;
    container.style.position = 'absolute';
    group.pixels.forEach(function(p) {
      px(p[0], p[1], p[2], container);
    });
    scene.appendChild(container);
  });

  // 6. Lantern (hangs at the end of the left branch)
  var lantern = document.createElement('div');
  lantern.className = 'lantern-group';
  lantern.style.position = 'absolute';
  lantern.style.left = '104px';
  lantern.style.top = '348px';

  // 6a. Glow area (round background behind the lantern)
  var glowArea = document.createElement('div');
  glowArea.className = 'glow-area';
  glowArea.style.cssText =
    'position:absolute; left:-12px; top:-12px;'
    + 'width:56px; height:56px;';

  var glowSoft = document.createElement('div');
  glowSoft.className = 'glow-soft';
  glowSoft.style.cssText =
    'position:absolute; left:0; top:0;'
    + 'width:56px; height:56px;';
  glowArea.appendChild(glowSoft);
  lantern.appendChild(glowArea);

  // 6b. Lantern top
  var lTop = document.createElement('div');
  lTop.className = 'px lantern-top';
  lTop.style.cssText =
    'left:8px; top:0; width:16px; height:6px;';
  lantern.appendChild(lTop);

  // 6c. Lantern body
  var lBody = document.createElement('div');
  lBody.className = 'px lantern';
  lBody.style.cssText =
    'left:4px; top:6px; width:24px; height:20px;';
  lantern.appendChild(lBody);

  // 6d. Light (yellow square)
  var lGlow = document.createElement('div');
  lGlow.className = 'px glow';
  lGlow.style.cssText =
    'left:8px; top:10px; width:16px; height:12px;';
  lantern.appendChild(lGlow);

  // 6e. Lantern bottom
  var lBottom = document.createElement('div');
  lBottom.className = 'px lantern-top';
  lBottom.style.cssText =
    'left:8px; top:26px; width:16px; height:4px;';
  lantern.appendChild(lBottom);

  scene.appendChild(lantern);

  // 7. Roots (spread from the base of the trunk)
  var roots = [
    [168, 416], [176, 412], [208, 412],
    [216, 416], [160, 420], [224, 420],
  ];
  roots.forEach(function(r) {
    px(r[0], r[1], 'root');
  });
}
