'use strict' /*jslint node:true*/;

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
  let nearestPos;
  const distances = diamondsPositions.map(el => (Math.abs(el.x - x) + Math.abs(el.y - y)));
  let minDistance = Math.min.apply(null,
    distances
  );
  console.log(' nearestPos', distances, minDistance);
  console.log(' Pos', diamondsPositions, x, y);
}

exports.play = function*(screen) {
  while (true) {
    let { x, y } = findPlayer(screen);
    let diamonds = findDiamonds(screen);
    findNearestDiamond({x, y}, diamonds);
    let moves = '';
    // console.log(' diamonds', diamonds);

    // if (' :*'.includes(screen[y-1][x]))
    //     moves += 'u';
    // if (' :*'.includes(screen[y+1][x]))
    //     moves += 'd';
    // if (' :*'.includes(screen[y][x+1])
    //     || screen[y][x+1]=='O' && screen[y][x+2]==' ')
    // {
    //     moves += 'r';
    // }
    // if (' :*'.includes(screen[y][x-1])
    //     || screen[y][x-1]=='O' && screen[y][x-2]==' ')
    // {
    //     moves += 'l';
    // }
    // yield moves[Math.floor(Math.random()*moves.length)];
    for (let i = 0; i <= moves.length; i++) {
      yield moves[i];
    }
    // return;
  }
};
