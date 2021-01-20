import { useEffect, useRef, useState } from 'react';
import { ReactComponent as Fish } from './fish.svg';
import './fishing.css';

let fishSpeed = 0.25;
let fishDestination = 50;
let down = true;
let externalProgress = 0;
let externalLevel = 0;
let animationActive = false;

const updateProgress = (
  fish: SVGSVGElement | null,
  greenBar: HTMLDivElement | null,
  progressBar: HTMLDivElement | null
) => {
  if (fish && greenBar && progressBar) {
    const fishTop = parseInt(fish.style.top.replace('%', ''));
    const greenBarTop = parseInt(greenBar.style.top.replace('%', ''));
    const inRange = fishTop >= greenBarTop && fishTop + 8 <= greenBarTop + 25;

    if (inRange) {
      externalProgress += 5;
    } else {
      externalProgress -= 5;
    }

    if (externalProgress > 1000) {
      externalLevel += 1;
      fishSpeed += 0.25;
      externalProgress = 0;
    }

    externalProgress =
      externalProgress > 1000 ? 1000 : externalProgress < 0 ? 0 : externalProgress;

    if (externalProgress < 200) {
      progressBar.style.backgroundColor = 'red';
    } else if (externalProgress < 400) {
      progressBar.style.backgroundColor = 'orange';
    } else {
      progressBar.style.backgroundColor = 'green';
    }
  }
  return externalLevel;
};

const fishNewPositionInterval = setInterval(() => {
  fishDestination = Math.floor(Math.random() * 100);
}, 1000);

export const Fishing = () => {
  const [interiorRectanglePosition, setInteriorRectanglePosition] = useState(0);
  const [fishPosition, setFishPosition] = useState(0);
  const [animate, setAnimate] = useState('');
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState(2);

  const fish = useRef<SVGSVGElement>(null);
  const greenBar = useRef<HTMLDivElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveStuff = () => {
      const externalLevel = updateProgress(
        fish.current,
        greenBar.current,
        progressBar.current
      );
      setLevel(externalLevel);

      setInteriorRectanglePosition((p) => {
        const newPos = p + (down === true ? 1 : -1.5);
        return newPos > 75 ? 75 : newPos < 0 ? 0 : newPos;
      });

      setFishPosition((p) => {
        const stayStill = fishDestination < p + 2 && fishDestination > p - 2;

        if (stayStill) return p;

        const newPos =
          p + (fishDestination > p ? fishSpeed : fishDestination < p ? -fishSpeed : 0);
        return newPos > 92 ? 92 : newPos < 0 ? 0 : newPos;
      });

      setProgress(externalProgress);

      return requestAnimationFrame(moveStuff);
    };

    const anim = requestAnimationFrame(moveStuff);

    window.addEventListener('mousedown', () => {
      down = false;

      if (!animationActive) {
        setAnimate('animate-class');
        animationActive = true;
        setTimeout(() => {
          setAnimate('');
          animationActive = false;
        }, 350);
      }
    });

    window.addEventListener('mouseup', () => {
      down = true;
    });

    return () => {
      cancelAnimationFrame(anim);
      clearInterval(fishNewPositionInterval);
    };
  }, []);

  return (
    <div className="fishing">
      <div className="fishing__rod">
        {[...new Array(8)].map(() => (
          <div className="fishing__rod__rod" />
        ))}
        <div className="fishing__rod__reel">
          <div className={`fishing__rod__reel__handle ${animate}`}>
            <div className="fishing__rod__reel__handle__nub"></div>
          </div>
        </div>
        <div className="fishing__rod__handle"></div>
      </div>
      <div className="fishing__bar">
        <div className="fishing__bar__interior">
          <div
            ref={greenBar}
            className="fishing__bar__interior__rectangle"
            style={{ top: `${interiorRectanglePosition}%` }}
          ></div>
          <Fish
            ref={fish}
            className="fishing__bar__interior__fish"
            style={{ top: `${fishPosition}%` }}
          />
        </div>
      </div>
      <div className="fishing__progress">
        <div className="fishing__progress__interior">
          <div
            ref={progressBar}
            className="fishing__progress__interior__progress"
            style={{ height: `${Math.floor(progress / 10)}%` }}
          ></div>
        </div>
      </div>
      <div className="catches">
        {[...new Array(level)].map(() => (
          <Fish className="fish" />
        ))}
      </div>
    </div>
  );
};
