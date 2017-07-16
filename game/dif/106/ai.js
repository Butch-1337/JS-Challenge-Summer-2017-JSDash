'use strict' /*jslint node:true*/;

const PASSABLE = [' ', ':', '*'];
const NOTPASSABLE = ['+', '#', 'O', '/', '|', '\\', '-'];

const findPlayer = screen => {
  for (let y = 0; y < screen.length; y++) {
    let row = screen[y];
    for (let x = 0; x < row.length; x++) {
      if (row[x] == 'A') return { x, y };
    }
  }
};

const findDiamonds = screen => {
  const diamondsPositions = [];
  for (let y = 0; y < screen.length; y++) {
    let row = screen[y];
    for (let x = 0; x < row.length; x++) {
      if (row[x] == '*') diamondsPositions.push({ x, y });
    }
  }
  return diamondsPositions;
};

const findNearestDiamond = ({x, y}, diamondsPositions) => {
  let length = 0;
  let n = 0;
  diamondsPositions.forEach((el, i) => {
    const elLength = Math.abs(el.x - x) + Math.abs(el.y - y);
    if (i == 0) length = elLength;
    if (elLength < length ) {
      length = elLength;
      n = i;
    }
  });
  return diamondsPositions[n];
}

const findNearestDiamond2 = (ax, ay, diamondsPositions, screen) => {
  let lengthArr = [];
  let length = 0;
  let n = 0;

  diamondsPositions.forEach((el, i) => {
    const dx = [1, 0, -1, 0];
    const dy = [0, 1, 0, -1];
    const H = screen.length;
    const W = screen[0].length;

    let grid = [...screen].map(el => el.split(''));
    let d, x, y, k;
    let stop = false;

    d = 0;
    grid[ay][ax] = 0;            // стартовая ячейка помечена 0
    do {
        stop = true;               // предполагаем, что все свободные клетки уже помечены
        for ( y = 0; y < H; ++y )
          for ( x = 0; x < W; ++x )
            if ( grid[y][x] == d )                         // ячейка (x, y) помечена числом d
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
      } while ( !stop && grid[el.y][el.x] == '*' );

    const elLength = grid[el.y][el.x];
    console.log(' elLength', elLength, el);
    // if (i == 0) console.log(' grid', grid);
    if (i == 0) length = elLength;
    if (elLength < length ) {
      length = elLength;
      lengthArr.push(length);
      n = i;
    }
  });
  console.log(' lengthArr', lengthArr);
  return diamondsPositions[n];
}

const lee = (ax, ay, bx, by, screen) => {
  const dx = [1, 0, -1, 0];
  const dy = [0, 1, 0, -1];
  const H = screen.length - 1;
  const W = screen[0].length
  let grid = [...screen].map(el => el.split(''));
  let d, x, y, k;
  let stop = false;
  let px = [];
  let py = [];
  let len;
  // for (let i=0;i<50;i++) console.log('lee', H, W);

  d = 0;
  grid[ay][ax] = 0;            // стартовая ячейка помечена 0
  do {
      stop = true;               // предполагаем, что все свободные клетки уже помечены
      for ( y = 0; y < H; ++y )
        for ( x = 0; x < W; ++x )
          if ( grid[y][x] == d )                         // ячейка (x, y) помечена числом d
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
    } while ( !stop && grid[by][bx] == '*' );
  // console.log('grid', grid)

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
            grid[iy][ix] == d)
      {
          x = x + dx[k];
          y = y + dy[k];           // переходим в ячейку, которая на 1 ближе к старту
          break;
      }
    }
  }

  px[0] = ax;
  py[0] = ay;                    // теперь px[0..len] и py[0..len] - координаты ячеек пути
  
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
  let nearDiam = findNearestDiamond({x, y}, diamonds);
  let {px, py} = lee(x, y, nearDiam.x, nearDiam.y, screen);
  console.log(' near diamond', nearDiam.x, nearDiam.y);

  return harvest(px, py, x, y, moves, screen, diamonds);
}

const harvest = (px, py, x, y, moves, screen, diamonds) => {
  let lPx = x - px[1];
  let lPy = y - py[1];

  // if (lPx === 0 && px[2]) lPx = x - px[2];
  // if (lPy === 0 && py[2]) lPy = y - py[2];

  console.log('PX PY', px, py);
  console.log('lPX lPY', lPx, lPy)

  for (let j = 0; j < Math.abs(lPx); j++) {
    if (lPx > 0) {
      moves += 'l';
      if (!PASSABLE.includes(screen[y][x-1])) {
        moves = doWhenStuck(x, y, screen, moves, diamonds);
        console.log('harvest stuck left', moves);
      }          
    } else {
      moves += 'r'; 
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
      if (screen[y-1][x] !== 'O')
        moves += 'd'; 
      if (!PASSABLE.includes(screen[y+1][x])) {
        moves = doWhenStuck(x, y, screen, moves, diamonds);
        for (let i=0;i<50;i++) console.log('harvest stuck down', moves); 
      }
    }
  }

  return moves;
}

exports.play = function*(screen) {
  while (true) {
    let { x, y } = findPlayer(screen);
    let diamonds = findDiamonds(screen);

    // let nearDiam = findNearestDiamond2(x, y, diamonds, screen);

    // let xLength = x - nearDiam.x;
    // let yLength = y - nearDiam.y;

    let moves = '';
    
    console.log(' player pos', x, y);

    moves = searchAndHarvest(x, y, moves, screen, diamonds);
    
    // moves = doWhenStuck(x, y, screen, moves, diamonds);
    console.log(' moves', moves);

    // setTimeout(function* (x, y) {
    //   let newPos = findPlayer(screen);
    //   // console.log('moves', moves);
    //   // console.log(' setTimeout', newPos, x, y);
    //   if (x === newPos.x && y === newPos.y) {
    //     moves = 'lurd'[Math.floor(Math.random()*'lurd'.length)];
    //     console.log('moves', moves);
    //     yield moves;
    //   }
        
    // },1000, x, y);

    for (let i = 0; i <= moves.length; i++) {
      yield moves[i];
    }
    // return;
  }
};
