'use strict' /*jslint node:true*/;

const PASSABLE = [' ', ':', '*'];
const NOTPASSABLE = ['+', '#', 'O', '/', '|', '\\', '-'];
const dx = [1, 0, -1, 0];
const dy = [0, 1, 0, -1];

let H = 22;
let W = 40;
let surround = false;
let hunting = false;
let butterflies = [];
let diamonds = [];
let stones = [];
let dirt = [];

const findPlayer = screen => {
  for (let y = 0; y < screen.length; y++) {
    let row = screen[y];
    for (let x = 0; x < row.length; x++) {
      if (row[x] === 'A') return { x, y };
    }
  }
};

const findThings = (things, screen) => {
  const thingsPositions = [];
  for (let y = 0; y < screen.length; y++) {
    let row = screen[y];
    for (let x = 0; x < row.length; x++) {
      if (things.includes(row[x])) thingsPositions.push({ x, y });
    }
  }
  return thingsPositions;
};

const leeSearch = (grid, targetArr, ax, ay, bx, by) => {
  let stop = false;
  let d, x, y, k;

  // console.log('leeSearch', grid.map(el => el.join('')));
  // console.log('leeSearch', grid[by][bx], H);
  d = 0;
  grid[ay][ax] = 0; // стартовая ячейка помечена 0
  do {
    stop = true; // предполагаем, что все свободные клетки уже помечены
    for (y = 0; y < H; ++y)
      for (x = 0; x < W; ++x)
        if (grid[y][x] === d) {
          // ячейка (x, y) помечена числом d
          for (
            k = 0;
            k < 4;
            ++k // проходим по всем непомеченным соседям
          ) {
            let iy = y + dy[k];
            let ix = x + dx[k];
            if (
              iy >= 0 &&
              iy < H &&
              ix >= 0 &&
              ix < W &&
              (PASSABLE.includes(grid[iy][ix]) ||
                targetArr.includes(grid[iy][ix]))
            ) {
              stop = false; // найдены непомеченные клетки
              grid[iy][ix] = d + 1; // распространяем волну
            }
          }
        }
    d++;
  } while (!stop && targetArr.includes(grid[by][bx]));
  return grid;
};

const findNearestLee = (targetArr, coordArr, ax, ay, screen) => {
  let lengthArr = [];
  let length = 0;
  let n = 0;

  coordArr.forEach((item, i) => {
    let grid = [...screen].map(el => el.split(''));

    grid = leeSearch(grid, targetArr, ax, ay, item.x, item.y);
    // console.log('grid',  grid.map(el => el.join('')));
    // hunting && console.log('item', item);

    const elLength = targetArr.includes(grid[item.y][item.x])
      ? 99999
      : grid[item.y][item.x];
    // hunting && console.log(' elLength', elLength, item);
    if (i == 0) length = elLength;
    if (elLength < length) {
      length = elLength;
      lengthArr.push(length);
      n = i;
    }
  });
  // console.log(' lengthArr', lengthArr);
  return coordArr[n];
};

const lee = (itemArr, ax, ay, bx, by, screen) => {
  let grid = [...screen].map(el => el.split(''));
  let d, x, y, k;
  let stop = false;
  let px = [];
  let py = [];
  let len;
  // console.log('lee', bx, by);

  grid[by][bx] = 'T';

  grid = leeSearch(grid, ['T'], ax, ay, bx, by);
  // console.log('grid',  grid.map(el => el.join(' ')));

  // восстановление пути
  len = grid[by][bx]; // длина кратчайшего пути из (ax, ay) в (bx, by)
  console.log('len', len);

  x = bx;
  y = by;
  d = len;
  while (d > 0) {
    px[d] = x;
    py[d] = y; // записываем ячейку (x, y) в путь
    d--;
    for (k = 0; k < 4; ++k) {
      let iy = y + dy[k];
      let ix = x + dx[k];
      if (iy >= 0 && iy < H && ix >= 0 && ix < W && grid[iy][ix] === d) {
        x = x + dx[k];
        y = y + dy[k]; // переходим в ячейку, которая на 1 ближе к старту
        break;
      }
    }
  }

  px[0] = ax;
  py[0] = ay; // теперь px[0..len] и py[0..len] - координаты ячеек пути
  // console.log('lee px py', px, py);
  return { px, py };
};

const searchAndHarvest = (x, y, moves, screen) => {
  // console.log('screen', screen);
  let nearDiam = findNearestLee(['*'], diamonds, x, y, screen) || { x, y };
  let { px, py } = lee(['*'], x, y, nearDiam.x, nearDiam.y, screen);
  console.log(' near diamond', nearDiam.x, nearDiam.y);

  return harvest(px, py, x, y, moves, screen);
};

const isFallingStone = (x, y, screen, up) => {
  if (
    y - 1 > 0 &&
    ['*', ':', '+', '/', '|', '\\', '-'].includes(screen[y - 1][x])
  )
    return false;

  // if (y-3 > 0 &&
  //     ['O', '*'].includes(screen[y-3][x]) &&
  //     ['O', '*'].includes(screen[y-2][x]) &&
  //     ['O', '*'].includes(screen[y-1][x]) &&
  //     screen[y][x] === ':') return false;

  if (
    y - 2 > 0 &&
    ['O', '*'].includes(screen[y - 2][x]) &&
    ['O', '*'].includes(screen[y - 1][x]) &&
    [':', '*'].includes(screen[y][x])
  )
    return false;

  if (
    y - 3 > 0 &&
    up &&
    screen[y - 3][x] === 'O' &&
    !['*', ':', '+', '/', '|', '\\', '-'].includes(screen[y - 2][x])
  ) {
    for (let i = 0; i < 15; i++) console.log('stone[y-3][x]');
    return true;
  }

  if (
    y - 2 > 0 &&
    // !up &&
    screen[y - 2][x] === 'O' &&
    !['*', ':', '+', '/', '|', '\\', '-'].includes(screen[y - 1][x])
  ) {
    for (let i = 0; i < 15; i++) console.log('stone[y-2][x]');
    return true;
  }

  return false;
};

const isFallingDiamond = (x, y, screen, up) => {
  if (y - 1 > 0 && [':', '+', '/', '|', '\\', '-'].includes(screen[y - 1][x]))
    return false;

  if (
    y - 2 > 0 &&
    ['O', '*'].includes(screen[y - 2][x]) &&
    ['O', '*'].includes(screen[y - 1][x]) &&
    [':', '*'].includes(screen[y][x])
  )
    return false;

  if (
    y - 3 > 0 &&
    up &&
    screen[y - 3][x] === '*' &&
    ![':', '+', '/', '|', '\\', '-'].includes(screen[y - 2][x])
  ) {
    // for (let i=0;i<5;i++) console.log('diam[y-3][x]');
    return true;
  }

  if (
    y - 2 > 0 &&
    !up &&
    screen[y - 2][x] === '*' &&
    ![':', '+', '/', '|', '\\', '-'].includes(screen[y - 1][x])
  ) {
    // for (let i=0;i<50;i++) console.log('diam[y-2][x]');
    return true;
  }

  return false;
};

const allowRight = (x, y, screen) => {
  if (
    screen[y - 1][x + 2] === 'O' &&
    ![':', '+', '/', '|', '\\', '-'].includes(screen[y - 1][x + 1])
  )
    return false;

  if (screen[y][x + 1] === 'B') return false;

  if (
    screen[y - 1][x - 1] === 'B' ||
    screen[y - 1][x] === 'B' ||
    screen[y - 1][x + 1] === 'B'
  )
    return false;

  return true;
};


const allowLeft = (x, y, screen) => {
  if (
    screen[y - 1][x - 2] === 'O' &&
    ![':', '+', '/', '|', '\\', '-'].includes(screen[y - 1][x - 1])
  )
    return false;

  if (screen[y][x - 1] === 'B') return false;

  if (
    screen[y - 1][x - 1] === 'B' ||
    screen[y - 1][x] === 'B' ||
    screen[y - 1][x + 1] === 'B'
  )
    return false;

  return true;
};


const hunt = (x, y, moves, screen) => {
  let wx = x;
  let wy = y;
  if (butterflies.length) {
    // let target = butterflies[butterflies.length - 1];
    // let target = findNearestLee(['/', '|', '\\', '-'], butterflies, x, y, screen) || {x, y};
    // let way = lee(['/', '|', '\\', '-'], x, y, target.x, target.y, screen);

    // let filteredDirt = dirt.filter(el =>
    //   (el.y < target.y &&
    //    el.x > target.x - 3 &&
    //    el.x < target.x + 3)
    // );

    let filteredDirt = dirt.filter(el => screen[el.y - 1][el.x] === 'O');
    // let nearestFilteredDirt = findNearestLee([':'], filteredDirt, x, y, screen) || {x, y};

    let dirtNearest = findNearestLee([':'], dirt, x, y, screen) || { x, y };

    let targetDirtX = filteredDirt && filteredDirt[0]
      ? filteredDirt[0].x
      : dirtNearest.x;
    let targetDirtY = filteredDirt && filteredDirt[0]
      ? filteredDirt[0].y
      : dirtNearest.y;

    let way = lee([':'], x, y, targetDirtX, targetDirtY, screen);

    // for (let i=0;i<10;i++) console.log('hunt', target, filteredDirt);
    wx = way.px;
    wy = way.py;
  }
  return { wx, wy };
};

const harvest = (px, py, x, y, moves, screen) => {
  let lPx = x - px[1];
  let lPy = y - py[1];

  if (lPx !== lPx || lPy !== lPy) {
    if (screen[y][x + 1] === 'O' && screen[y][x + 2] === ' ') {
      moves += 'r';
    } else
    if (screen[y][x - 1] === 'O' && screen[y][x - 2] === ' ') {
      moves += 'l';
    } else {
      surround = true;
      if (surround) {
        hunting = true;
        let huntObj = hunt(x, y, moves, screen);
        // for (let i=0;i<10;i++) console.log('huntObj', huntObj);
        lPx = x - huntObj.wx[1];
        lPy = y - huntObj.wy[1];
      }
    }
  } // else surround = false;

  // console.log('PX PY', px, py);
  console.log('lPX lPY', lPx, lPy);
  // console.log('area', screen);

  for (let j = 0; j < Math.abs(lPx); j++) {
    if (lPx > 0) {
      if (
        screen[y][x - 1] !== 'B' &&
        !isFallingStone(x - 1, y, screen) &&
        !isFallingDiamond(x - 1, y, screen) &&
        allowRight(x, y, screen)
      ) {
        moves += 'l';
      } else {
        // for (let i=0;i<10;i++) console.log('STONE when move left');
      }
    } else {
      if (
        screen[y][x + 1] !== 'B' &&
        !isFallingStone(x + 1, y, screen) &&
        !isFallingDiamond(x + 1, y, screen) &&
        allowLeft(x, y, screen)
      ) {
        moves += 'r';
      } else {
        // for (let i=0;i<10;i++) console.log('STONE when move right');
      }
    }
  }

  for (let k = 0; k < Math.abs(lPy); k++) {
    if (lPy > 0) {
      if (
        !isFallingStone(x, y, screen, true) &&
        !isFallingDiamond(x, y, screen, true) &&
        screen[y - 1][x] !== 'B' &&
        screen[y - 1][x + 1] !== 'B' &&
        screen[y - 1][x - 1] !== 'B' &&
        screen[y - 2][x] !== 'B' &&
        screen[y - 2][x + 1] !== 'B' &&
        screen[y - 2][x - 1] !== 'B'
      ) {
        moves += 'u';
        for (let i = 0; i < 10; i++)
          console.log('move up                    ');
      } else {
        if (
          PASSABLE.includes(screen[y][x + 1]) &&
          !isFallingStone(x + 1, y, screen) &&
          !isFallingDiamond(x + 1, y, screen) &&
          allowRight(x, y, screen)
        )
          moves += 'r';
        else if (
          PASSABLE.includes(screen[y][x - 1]) &&
          !isFallingStone(x - 1, y, screen) &&
          !isFallingDiamond(x - 1, y, screen) &&
          allowLeft(x, y, screen)
        )
          moves += 'l';
        else {
          moves += 'u';
          for (let i = 0; i < 50; i++)
            console.log('ELSE when move up, moves:', moves, '           ');
        }
          // else if (PASSABLE.includes(screen[y+1][x])) moves += 'd';
        for (let i = 0; i < 10; i++)
          console.log('STONE when move up, moves:', moves, '               ');
      }
    } else {
      if (
        screen[y - 1][x] !== 'O' &&
        !isFallingStone(x, y, screen) &&
        !isFallingDiamond(x, y, screen) &&
        screen[y + 1][x] !== 'B'
      ) {
        moves += 'd';
      } else {
        if (
          PASSABLE.includes(screen[y][x + 1]) &&
          !isFallingStone(x + 1, y, screen) &&
          !isFallingDiamond(x + 1, y, screen) &&
          allowRight(x, y, screen)
        )
          moves += 'r';
        else if (
          PASSABLE.includes(screen[y][x - 1]) &&
          !isFallingStone(x - 1, y, screen) &&
          !isFallingDiamond(x - 1, y, screen) &&
          allowLeft(x, y, screen)
        )
          moves += 'l';
        else moves += 'd';
        for (let i = 0; i < 10; i++) console.log('STONE when move down', moves);
      }
    }
  }

  return moves;
};

let butterfliesArea = (plx, ply, butterflies, screen) => {
  let grid = [...screen].map(el => el.split(''));

  butterflies.forEach((butterfly, i) => {
    let d, x, y, k;
    let stop = false;

    d = 0;
    grid[butterfly.y][butterfly.x] = 0; // стартовая ячейка помечена 0
    do {
      stop = true; // предполагаем, что все свободные клетки уже помечены
      for (y = 0; y < H; ++y)
        for (x = 0; x < W; ++x)
          if (grid[y][x] === d) {
            // ячейка (x, y) помечена числом d
            for (
              k = 0;
              k < 4;
              ++k // проходим по всем непомеченным соседям
            ) {
              let iy = y + dy[k];
              let ix = x + dx[k];
              if (
                iy >= 0 &&
                iy < H &&
                ix >= 0 &&
                ix < W &&
                !surround &&
                [' ', '*'].includes(grid[iy][ix]) &&
                !['A'].includes(grid[iy][ix])
              ) {
                stop = false; // найдены непомеченные клетки
                grid[iy][ix] = d + 1; // распространяем волну
              }
            }
          }
      d++;
    } while (!stop);
  });
  // console.log('grid', grid.map(el => el.join(' ')));
  let x, y, k;
  for (y = 0; y < H; ++y)
    for (x = 0; x < W; ++x)
      if (typeof grid[y][x] === 'number') {
        for (k = 0; k < 4; ++k) {
          let iy = y + dy[k];
          let ix = x + dx[k];
          if (
            iy >= 0 &&
            iy < H &&
            ix >= 0 &&
            ix < W &&
            !surround &&
            [':', '*'].includes(grid[iy][ix]) &&
            !['A'].includes(grid[iy][ix])
          ) {
            grid[iy][ix] = '/';
          }
        }
        grid[y][x] = '-';
      }

  // console.log('grid', surround, grid.map(el => el.join('')));
  return grid.map(el => el.join(''));
};

const butterfliesShortArea = (butterflies, screen) => {
  let grid = [...screen].map(el => el.split(''));

  let x, y, k;
  for (y = 0; y < H; ++y)
    for (x = 0; x < W; ++x)
      if (['/', '|', '\\', '-'].includes(grid[y][x])) {
        for (k = 0; k < 4; ++k) {
          let iy = y + dy[k];
          let ix = x + dx[k];
          if (
            iy >= 0 &&
            iy < H &&
            ix >= 0 &&
            ix < W &&
            // [':', 'O', '*'].includes(grid[iy][ix]) &&
            !['A'].includes(grid[iy][ix])
          ) {
            grid[iy][ix] = 'B';
          }
        }
      }

  return grid.map(el => el.join(''));
};

exports.play = function*(screen) {
  H = screen.length - 1;
  W = screen[0].length;

  while (true) {
    let { x, y } = findPlayer(screen);
    diamonds = findThings(['*'], screen);
    butterflies = findThings(['/', '|', '\\', '-'], screen);
    // console.log('butterflies', butterflies);
    stones = findThings(['O'], screen);
    dirt = findThings([':'], screen);
    // console.log('stones', stones);

    // let area = surround
    //             ? hunting
    //               ? screen
    //               : butterfliesShortArea(butterflies, screen)
    //             : butterfliesArea(x, y, butterflies, screen);

    let area = surround
      ? butterfliesShortArea(butterflies, screen)
      : butterfliesArea(x, y, butterflies, screen);

    let moves = '';

    console.log(' player pos', x, y);

    moves = searchAndHarvest(x, y, moves, area);

    console.log(' moves', moves);
    // console.log(' shortArea', butterfliesShortArea(butterflies, screen));
    // console.log(area);

    yield moves;
  }
};
