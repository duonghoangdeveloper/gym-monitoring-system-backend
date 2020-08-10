export const detectDangeous = ({ barbells, faces, poses }) => {
  // console.log(poses);
  // console.log(barbells);
  console.log(faces);
  const people = poses
    .filter(
      pose =>
        pose.leftShoulder ||
        pose.rightShoulder ||
        pose.leftWrist ||
        pose.rightWrist
    )
    .map(person => ({
      barbell: barbells.find(
        ({ bottom, left, right, top }) =>
          checkInside(
            calculateBodyPart(person.leftWrist) ?.x,
            calculateBodyPart(person.leftWrist) ?.y,
            top,
            right,
            bottom,
            left
          ) ||
          checkInside(
            calculateBodyPart(person.rightWrist) ?.x,
            calculateBodyPart(person.rightWrist) ?.y,
            top,
            right,
            bottom,
            left
          ) ||
          checkInside(
            calculateBodyPart(person.rightShoulder) ?.x,
            calculateBodyPart(person.rightShoulder) ?.y,
            top,
            right,
            bottom,
            left
          ) ||
          checkInside(
            calculateBodyPart(person.rightShoulder) ?.x,
            calculateBodyPart(person.rightShoulder) ?.y,
            top,
            right,
            bottom,
            left
          )
      ),
      leftEye: calculateBodyPart(person.leftEye),
      leftShoulder: calculateBodyPart(person.leftShoulder),
      leftWrist: calculateBodyPart(person.leftWrist),
      nose: calculateBodyPart(person.nose),
      rightEye: calculateBodyPart(person.rightEye),
      rightShoulder: calculateBodyPart(person.rightShoulder),
      rightWrist: calculateBodyPart(person.rightWrist),
    }));

  // if (people.some(person => person.barbell)) {
  //   console.log(people);
  //   if (Math.random() < 0.25) {
  //     return true;
  //   }
  // }

  return false;

  // console.log(people);
};

const checkInside = (x, y, rectTop, rectRight, rectBottom, rectLeft) =>
  // console.log(x, y, rectTop, rectRight, rectBottom, rectLeft) ||
  x >= rectLeft - 80 &&
  x <= rectRight + 80 &&
  y <= rectBottom + 80 &&
  y >= rectTop - 80;

const WIDTH = 1920;
const HEIGHT = 1080;

const calculateBodyPart = bodyPart => {
  if (bodyPart) {
    return {
      x: bodyPart.x * WIDTH,
      y: bodyPart.y * HEIGHT,
    };
  }
};
