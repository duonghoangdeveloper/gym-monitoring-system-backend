export const calculate2LineTails = (theta0, theta1, rectangle) => {
  if (
    theta0 !== null &&
    theta1 !== null &&
    !Number.isNaN(theta0) &&
    !Number.isNaN(theta1) &&
    typeof rectangle?.width === 'number' &&
    typeof rectangle?.height === 'number'
  ) {
    // Line: y = theta0 + theta1 * x

    // y = 0 => x = - theta0 / theta1
    const topCrossPointX = -theta0 / theta1;
    const topCrossPoint =
      topCrossPointX >= 0 && topCrossPointX <= rectangle.width
        ? {
            x: topCrossPointX,
            y: 0,
          }
        : null;

    // x = 0 => y = theta0
    const leftCrossPointY = theta0;
    const leftCrossPoint =
      leftCrossPointY >= 0 && leftCrossPointY <= rectangle.height
        ? {
            x: 0,
            y: leftCrossPointY,
          }
        : null;

    // y = rectangle.height => x = (rectangle.height - theta0) / theta1
    const bottomCrossPointX = (rectangle.height - theta0) / theta1;
    const bottomCrossPoint =
      bottomCrossPointX >= 0 && bottomCrossPointX <= rectangle.width
        ? {
            x: bottomCrossPointX,
            y: rectangle.height,
          }
        : null;

    // x = rectangle.width => y = theta0 + theta1 * rectangle.width
    const rightCrossPointY = theta0 + theta1 * rectangle.width;
    const rightCrossPoint =
      rightCrossPointY >= 0 && rightCrossPointY <= rectangle.height
        ? {
            x: rectangle.width,
            y: rightCrossPointY,
          }
        : null;

    return [
      topCrossPoint,
      leftCrossPoint,
      bottomCrossPoint,
      rightCrossPoint,
    ].filter(_ => _);
  }

  return [];
};

export const detectDangeous = ({ barbells, faces, poses }) => {
  // console.log(barbells);
  // console.log(faces);
  // console.log(poses);
  const people = poses
    .filter(
      pose =>
        // pose.leftShoulder &&
        // pose.rightShoulder &&
        pose.leftWrist && pose.rightWrist
    )
    .map(person => ({
      barbell: barbells.find(
        ({ bottom, left, right, top }) =>
          checkInside(
            person.leftWrist?.x,
            person.leftWrist?.y,
            top,
            right,
            bottom,
            left
          ) &&
          checkInside(
            person.rightWrist?.x,
            person.rightWrist?.y,
            top,
            right,
            bottom,
            left
          )
      ),
      // face: faces.find(
      //   ({ bottom, left, right, top }) =>
      //     checkInside(
      //       person.nose ?.x,
      //       person.nose ?.y,
      //       top,
      //       right,
      //       bottom,
      //       left
      //     ) ||
      //     checkInside(
      //       person.leftEye ?.x,
      //       person.leftEye ?.y,
      //       top,
      //       right,
      //       bottom,
      //       left
      //     ) ||
      //     checkInside(
      //       person.rightEye ?.x,
      //       person.rightEye ?.y,
      //       top,
      //       right,
      //       bottom,
      //       left
      //     )
      // ),
      leftEye: person.leftEye,
      leftHip: person.leftHip,
      leftShoulder: person.leftShoulder,
      leftWrist: person.leftWrist,
      nose: person.nose,
      rightEye: person.rightEye,
      rightHip: person.rightHip,
      rightShoulder: person.rightShoulder,
      rightWrist: person.rightWrist,
    }))
    .filter(({ barbell }) => barbell)
    .map(person => {
      const barbellHolding = person.barbell.lines.map(
        ({ tails: [tail1, tail2] }) => {
          const angle = calculateAngleBetweenLines(
            person.leftWrist,
            person.rightWrist,
            movePoint(tail1, person.barbell.left, person.barbell.top),
            movePoint(tail2, person.barbell.left, person.barbell.top)
          );
          return {
            angle: Math.abs(angle > 90 ? 180 - angle : angle),
            leftProjectDistance: calculateProjectDistance(
              person.leftWrist,
              movePoint(tail1, person.barbell.left, person.barbell.top),
              movePoint(tail2, person.barbell.left, person.barbell.top)
            ),
            rightProjectDistance: calculateProjectDistance(
              person.rightWrist,
              movePoint(tail1, person.barbell.left, person.barbell.top),
              movePoint(tail2, person.barbell.left, person.barbell.top)
            ),
          };
        }
      );
      const minBarbellSide = Math.min(
        person.barbell.right - person.barbell.left,
        person.barbell.bottom - person.barbell.top
      );
      return {
        ...person,
        averageDistanceLessThanOneForth: barbellHolding.reduce(
          (accumulator, currentValue) =>
            accumulator +
            (currentValue.leftProjectDistance +
              currentValue.rightProjectDistance <
            minBarbellSide / 2
              ? 1
              : 0),
          0
        ),
        barbellLinesCount: barbellHolding.length,
        lessThan10Degree: barbellHolding.reduce(
          (accumulator, currentValue) =>
            accumulator + (currentValue.angle < 10 ? 1 : 0),
          0
        ),
      };
    });

  return people.some(person => {
    const angleShoulder =
      person.leftShoulder && person.rightShoulder
        ? calculateAngleBetweenLines(
            person.rightWrist,
            person.leftWrist,
            person.rightShoulder,
            person.leftShoulder
          )
        : null;
    const angleHip =
      person.leftHip && person.rightHip
        ? calculateAngleBetweenLines(
            person.rightWrist,
            person.leftWrist,
            person.rightHip,
            person.leftHip
          )
        : null;
    // console.log(
    //   'Wrist near barbell bar:',
    //   person.averageDistanceLessThanOneForth / person.barbellLinesCount
    // );
    // console.log(
    //   'Wrist parallel barbell bar:',
    //   person.lessThan10Degree / person.barbellLinesCount
    // );
    // console.log('Wrist - shoulder angle:', angleShoulder);
    // console.log('Wrist - hip angle:', angleHip);

    // const THRESHOLD = 24;
    const THRESHOLD = 8;

    return (
      person.averageDistanceLessThanOneForth / person.barbellLinesCount >=
        0.5 &&
      person.lessThan10Degree / person.barbellLinesCount > 0.5 &&
      !(
        angleShoulder &&
        (Math.abs(angleShoulder) < THRESHOLD ||
          Math.abs(angleShoulder - 180) < THRESHOLD)
      ) &&
      !(
        angleHip &&
        (Math.abs(angleHip) < THRESHOLD || Math.abs(angleHip - 180) < THRESHOLD)
      )
    );
  });
};

const checkInside = (x, y, rectTop, rectRight, rectBottom, rectLeft) =>
  x >= rectLeft && x <= rectRight && y <= rectBottom && y >= rectTop;

const calculateAngleBetweenLines = (
  { x: A1x, y: A1y },
  { x: A2x, y: A2y },
  { x: B1x, y: B1y },
  { x: B2x, y: B2y }
) => {
  const dAx = A2x - A1x;
  const dAy = A2y - A1y;
  const dBx = B2x - B1x;
  const dBy = B2y - B1y;
  let angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
  if (angle < 0) {
    angle *= -1;
  }
  const degreeAngle = angle * (180 / Math.PI);
  return degreeAngle;
};

const calculateProjectDistance = (
  { x, y },
  { x: x1, y: y1 },
  { x: x2, y: y2 }
) => {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0)
    // in case of 0 length line
    param = dot / lenSq;

  let xx;
  let yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

const movePoint = ({ x, y }, left, top) => ({
  x: x + left,
  y: y + top,
});

// const WIDTH = 1920;
// const HEIGHT = 1080;

// const calculateBodyPart = bodyPart => {
//   if (bodyPart) {
//     return {
//       x: bodyPart.x * WIDTH,
//       y: bodyPart.y * HEIGHT,
//     };
//   }
// };
