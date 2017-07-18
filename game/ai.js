'use strict' /*jslint node:true*/;

const PASSABLE = [' ', ':', '*'];
const NOTPASSABLE = ['+', '#', 'O', '/', '|', '\\', '-'];

let surround = false;

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
      if ( things.includes(row[x])) thingsPositions.push({ x, y });
    }
  }
  return thingsPositions;
};

const findNearestDiamond = ({x, y}, diamondsPositions) => {
  let length = 0;
  let n = 0;
  diamondsPositions.forEach((el, i) => {
    const elLength = Math.abs(el.x - x) + Math.abs(el.y - y);
    if (i === 0) length = elLength;
    if (elLength < length ) {
      length = elLength;
      n = i;
    }
  });
  return diamondsPositions[n];
}

const findNearestDiamondLee = (ax, ay, diamondsPositions, screen) => {
  let lengthArr = [];
  let length = 0;
  let n = 0;

  diamondsPositions.forEach((diam, i) => {
    const dx = [1, 0, -1, 0];
    const dy = [0, 1, 0, -1];
    const H = screen.length - 1;
    const W = screen[0].length;

    let grid = [...screen].map(el => el.split(''));
    grid.pop();
    let d, x, y, k;
    let stop = false;

    d = 0;
    grid[ay][ax] = 0;            // стартовая ячейка помечена 0
    do {
        stop = true;               // предполагаем, что все свободные клетки уже помечены
        for ( y = 0; y < H; ++y )
          for ( x = 0; x < W; ++x )
            if ( grid[y][x] === d )                         // ячейка (x, y) помечена числом d
            {
              for ( k = 0; k < 4; ++k )                    // проходим по всем непомеченным соседям
              {
                 let iy = y + dy[k]; 
                 let ix = x + dx[k];
                 if ( iy >= 0 && iy < H && ix >= 0 && ix < W &&
                      PASSABLE.includes(grid[iy][ix]))
                 {
                    stop = false;              // найдены непомеченные клетки
                    grid[iy][ix] = d + 1;      // распространяем волну
                 }
              }
            }
        d++;
      } while ( !stop && grid[diam.y][diam.x] === '*' );

    const elLength = grid[diam.y][diam.x] === '*' ? 99999 : grid[diam.y][diam.x];
    // console.log(' elLength', elLength, diam);
    if (i == 0) length = elLength;
    if (elLength < length ) {
      length = elLength;
      lengthArr.push(length);
      n = i;
    }
  });
  // console.log(' lengthArr', lengthArr);
  return diamondsPositions[n];
}

const lee = (ax, ay, bx, by, screen) => {
  const dx = [1, 0, -1, 0];
  const dy = [0, 1, 0, -1];
  const H = screen.length - 1;
  const W = screen[0].length;
  let grid = [...screen].map(el => el.split(''));
  grid.pop();
  let d, x, y, k;
  let stop = false;
  let px = [];
  let py = [];
  let len;
  // console.log('lee', bx, by);

  d = 0;
  grid[ay][ax] = 0;            // стартовая ячейка помечена 0
  do {
      stop = true;               // предполагаем, что все свободные клетки уже помечены
      for ( y = 0; y < H; ++y )
        for ( x = 0; x < W; ++x ) {
          if ( grid[y][x] === d )                         // ячейка (x, y) помечена числом d
          {
            for ( k = 0; k < 4; ++k )                    // проходим по всем непомеченным соседям
            {
              let iy = y + dy[k]; 
              let ix = x + dx[k];

              if ( iy >= 0 && iy < H && ix >= 0 && ix < W &&
                    PASSABLE.includes(grid[iy][ix]))
              {
                // for (let i=0; i<grid.length; i++) console.log('grid', x, y, grid[i].join(''));
                stop = false;              // найдены непомеченные клетки
                grid[iy][ix] = d + 1;      // распространяем волну
              }
            }
          }
        }
      d++;
      // console.log('d', d, stop, grid[by][bx]);
    } while ( !stop && grid[by][bx] === '*' );
  // for (let i=0; i<grid.length; i++) console.log('grid', grid[i].join(' '));

    // восстановление пути
  len = grid[by][bx];            // длина кратчайшего пути из (ax, ay) в (bx, by)
  console.log('len', len)

  x = bx;
  y = by;
  d = len;
  while ( d > 0 )
  {
    px[d] = x;
    py[d] = y;                   // записываем ячейку (x, y) в путь
    d--;
    for (k = 0; k < 4; ++k)
    {
       let iy = y + dy[k];
       let ix = x + dx[k];
       if ( iy >= 0 && iy < H && ix >= 0 && ix < W &&
            grid[iy][ix] === d)
      {
          x = x + dx[k];
          y = y + dy[k];           // переходим в ячейку, которая на 1 ближе к старту
          break;
      }
    }
  }

  px[0] = ax;
  py[0] = ay;                    // теперь px[0..len] и py[0..len] - координаты ячеек пути
  // console.log('lee px py', px, py);
  return {px, py};
}

const doWhenStuck = (x, y, screen, moves, diamonds) => {
  // for (let i=0;i<50;i++) console.log('doWhenStuck', moves[0]);

  if (NOTPASSABLE.includes(screen[y][x-1]) && moves[0] === 'l') {
    moves = moveToPassable(x, y, moves, screen, diamonds);
  }
    
  if (NOTPASSABLE.includes(screen[y][x+1]) && moves[0] === 'r') {
    // for (let i=0;i<100;i++) console.log('TST');
    moves = moveToPassable(x, y, moves, screen, diamonds);
  }

  if (NOTPASSABLE.includes(screen[y-1][x]) && moves[0] === 'u') {
    moves = moveToPassable(x, y, moves, screen, diamonds);
  }

  if (NOTPASSABLE.includes(screen[y+1][x]) && moves[0] === 'd') {
    moves = moveToPassable(x, y, moves, screen, diamonds);
  } 

  return moves;
}

const moveToPassable = (x, y, moves, screen, diamonds) => {
    
  if (PASSABLE.includes(screen[y-1][x])) {
    moves += 'u';
    // moves = searchAndHarvest(x, y, moves, screen, diamonds);
  }

  if (PASSABLE.includes(screen[y+1][x]) && screen[y-1][x] !== 'O' ) {
    moves += 'd';
    // moves = searchAndHarvest(x, y, moves, screen, diamonds);
  }

  if (PASSABLE.includes(screen[y][x+1])) {
    moves += 'r';
    // moves = searchAndHarvest(x, y, moves, screen, diamonds);
  }
  
  if (PASSABLE.includes(screen[y][x-1])) {
    moves += 'l';
    // moves = searchAndHarvest(x, y, moves, screen, diamonds);
  }
  
  return moves;
}

const searchAndHarvest = (x, y, moves, screen, diamonds) => {
  // let nearDiam = findNearestDiamond({x, y}, diamonds);
  // console.log('screen', screen);
  let nearDiam = findNearestDiamondLee(x, y, diamonds, screen);
  let {px, py} = lee(x, y, nearDiam.x, nearDiam.y, screen);
  console.log(' near diamond', nearDiam.x, nearDiam.y);

  return harvest(px, py, x, y, moves, screen, diamonds);
}

const isFallingStone = (x, y, screen) => {

  if (y - 1 > 0 &&
      ['*',':','+', '/', '|', '\\', '-'].includes(screen[y-1][x])) return false;

  // if (y-3 > 0 &&
  //     ['O', '*'].includes(screen[y-3][x]) &&
  //     ['O', '*'].includes(screen[y-2][x]) &&
  //     ['O', '*'].includes(screen[y-1][x]) &&
  //     screen[y][x] === ':') return false;

  if (y-2 > 0 &&
      ['O', '*'].includes(screen[y-2][x]) &&
      ['O', '*'].includes(screen[y-1][x]) &&
      [':', '*'].includes(screen[y][x])) return false;

  if (y-3 > 0 &&
      screen[y-3][x] === 'O' &&
      !['*',':','+', '/', '|', '\\', '-'].includes(screen[y-2][x])) {
    for (let i=0;i<50;i++) console.log('stone[y-3][x]');
    return true; 
  }

  if (y-2 > 0 &&
      screen[y-2][x] === 'O' &&
      !['*',':','+', '/', '|', '\\', '-'].includes(screen[y-1][x])) {
    for (let i=0;i<50;i++) console.log('stone[y-2][x]');
    return true;
  }

  return false; 
}

const isFallingDiamond = (x, y, screen) => {

  if (y - 1 > 0 &&
      [':','+', '/', '|', '\\', '-'].includes(screen[y-1][x])) return false;

  if (y-2 > 0 &&
      ['O', '*'].includes(screen[y-2][x]) &&
      ['O', '*'].includes(screen[y-1][x]) &&
      screen[y][x] === ':') return false;

  if (y-3 > 0 &&
      screen[y-3][x] === '*' &&
      ![':','+', '/', '|', '\\', '-'].includes(screen[y-2][x])) {
    for (let i=0;i<50;i++) console.log('diam[y-3][x]');
    return true;
  }

  // if (y-2 > 0 &&
  //     screen[y-2][x] === '*' &&
  //     ![':','+', '/', '|', '\\', '-'].includes(screen[y-1][x])) {
  //   for (let i=0;i<50;i++) console.log('diam[y-2][x]');
  //   return true;
  // }

  return false; 
}

const harvest = (px, py, x, y, moves, screen, diamonds) => {
  let lPx = x - px[1];
  let lPy = y - py[1];

  if (lPx !== lPx || lPy !== lPy) {
    surround = true;
    // moves = moveToPassable(x, y, moves, screen, diamonds);
  } else surround = false;


  // if (lPx === 0 && px[2]) lPx = x - px[2];
  // if (lPy === 0 && py[2]) lPy = y - py[2];

  console.log('PX PY', px, py);
  console.log('lPX lPY', lPx, lPy)

  for (let j = 0; j < Math.abs(lPx); j++) {
    if (lPx > 0) {

      if (!isFallingStone(x-1, y, screen) &&
          !isFallingDiamond(x-1, y, screen)) moves += 'l';

      if (!PASSABLE.includes(screen[y][x-1])) {
        moves = doWhenStuck(x, y, screen, moves, diamonds);
        // console.log('harvest stuck left', moves);
      }          
    } else {

      if (!isFallingStone(x+1, y, screen) &&
          !isFallingDiamond(x+1, y, screen)) moves += 'r';

      if (!PASSABLE.includes(screen[y][x+1])) {
        moves = doWhenStuck(x, y, screen, moves, diamonds); 
      }
    }
  }

  for (let k = 0; k < Math.abs(lPy); k++) {
    if (lPy > 0) {
      moves += 'u'; 
      if (!PASSABLE.includes(screen[y-1][x])) {
        moves = doWhenStuck(x, y, screen, moves, diamonds); 
      }
    } else {
      if (screen[y-1][x] !== 'O' &&
          !isFallingStone(x, y, screen) &&
          !isFallingDiamond(x, y, screen)) {
        moves += 'd';
      } else {
        if (PASSABLE.includes(screen[y][x+1])) moves += 'r';
        if (PASSABLE.includes(screen[y][x-1])) moves += 'l';
      } 
         
      if (!PASSABLE.includes(screen[y+1][x])) {
        moves = doWhenStuck(x, y, screen, moves, diamonds);
        // for (let i=0;i<50;i++) console.log('harvest stuck down', moves);
      }
    }
  }

  return moves;
}

let butterfliesArea = (plx, ply, butterflies, screen) => {

  let grid = [...screen].map(el => el.split(''));
  grid.pop();
  const dx = [1, 0, -1, 0];
  const dy = [0, 1, 0, -1];
  const H = screen.length - 1;
  const W = screen[0].length;

  butterflies.forEach((butterfly, i) => {

    let d, x, y, k;
    let stop = false;

    d = 0;
    grid[butterfly.y][butterfly.x] = 0;            // стартовая ячейка помечена 0
    do {
        stop = true;               // предполагаем, что все свободные клетки уже помечены
        for ( y = 0; y < H; ++y )
          for ( x = 0; x < W; ++x )
            if ( grid[y][x] === d )                         // ячейка (x, y) помечена числом d
            {
              for ( k = 0; k < 4; ++k )                    // проходим по всем непомеченным соседям
              {
                 let iy = y + dy[k]; 
                 let ix = x + dx[k];
                 if ( iy >= 0 && iy < H && ix >= 0 && ix < W &&
                      !surround &&
                      [' ', '*'].includes(grid[iy][ix]) &&
                      !['A'].includes(grid[iy][ix]) )
                 {
                    stop = false;              // найдены непомеченные клетки
                    grid[iy][ix] = d + 1;      // распространяем волну
                 }
              }
            }
        d++;
      } while ( !stop );
  });
  // console.log('grid', grid.map(el => el.join(' ')));
  let x, y, k;
  for ( y = 0; y < H; ++y )
    for ( x = 0; x < W; ++x )
      if ( typeof grid[y][x] === 'number' )
      {
        for ( k = 0; k < 4; ++k )
        {
           let iy = y + dy[k]; 
           let ix = x + dx[k];
           if ( iy >= 0 && iy < H && ix >= 0 && ix < W &&
                !surround &&
                [':', 'O', '*'].includes(grid[iy][ix]) &&
                !['A'].includes(grid[iy][ix]) )
           {
              grid[iy][ix] = '/';
           }
        }
        grid[y][x] = '-';
      }

  // console.log('grid', surround, grid.map(el => el.join('')));
  return grid.map(el => el.join(''))
}

const avoid = (x, y, moves, screen) => {
  let grid = [...screen].map(el => el.split(''));
  console.log('avoid', grid.map(el => el.join('')));

  if (grid[y-1][x] = ' ' && ['O', '*'].includes(grid[y-2][x])) {
    console.log('avoid if');
    if (PASSABLE.includes(screen[y][x+1])) moves += 'r';
    if (PASSABLE.includes(screen[y][x-1])) moves += 'l';
  }

  return moves;
}

exports.play = function*(screen) {
  while (true) {
    let { x, y } = findPlayer(screen);
    let diamonds = findThings(['*'], screen);

    let butterflies = findThings(['/', '|', '\\', '-'], screen);
    // console.log('butterflies', butterflies);

    let area = butterfliesArea(x, y, butterflies, screen);

    let moves = '';
    
    console.log(' player pos', x, y);

    // moves += avoid(x, y, moves, screen);
    moves = searchAndHarvest(x, y, moves, area, diamonds);
    
    // moves = doWhenStuck(x, y, screen, moves, diamonds);
    console.log(' moves', moves);

    for (let i = 0; i <= moves.length; i++) {
      yield moves[i];
    }
    // return;
  }
};
