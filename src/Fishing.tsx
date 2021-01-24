import { useEffect, useRef, useState } from 'react';
import { ReactComponent as Fish } from './fish.svg';
import { ReactComponent as Seaweed } from './seaweed.svg';
import './fishing.css';

let fishSpeed = 0.25;
let fishDestination = 50;
let down = true;
let externalProgress = 0;
let externalLevel = 0;
let animationActive = false;
let justCaught = false;

const updateProgress = (
  fish: SVGSVGElement | null,
  greenBar: HTMLDivElement | null,
  progressBar: HTMLDivElement | null,
  fishOn: HTMLAudioElement | null,
  youGotIt: HTMLAudioElement | null
) => {
  if (fish && greenBar && progressBar) {
    const fishTop = parseInt(fish.style.top.replace('%', ''));
    const greenBarTop = parseInt(greenBar.style.top.replace('%', ''));
    const inRange = fishTop >= greenBarTop && fishTop + 8 <= greenBarTop + 25;
    const inWideRange = fishTop >= greenBarTop - 10 && fishTop + 8 <= greenBarTop + 35;

    if (inRange) {
      if (justCaught === false) {
        justCaught = true;
        fishOn?.play();
      }
      externalProgress += 5;
    } else {
      externalProgress -= 5;
    }

    if (!inWideRange) {
      justCaught = false;
    }

    if (externalProgress > 1000) {
      externalLevel += 1;
      fishSpeed += 0.25;
      externalProgress = 0;
      youGotIt?.play();
    }

    externalProgress =
      externalProgress > 1000 ? 1000 : externalProgress < 0 ? 0 : externalProgress;

    if (externalProgress < 200) {
      progressBar.style.backgroundColor = 'red';
    } else if (externalProgress < 400) {
      progressBar.style.backgroundColor = 'orange';
    } else {
      progressBar.style.backgroundColor = '#5bff00';
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
  const [level, setLevel] = useState(0);

  const fish = useRef<SVGSVGElement>(null);
  const greenBar = useRef<HTMLDivElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);

  const audio = useRef<HTMLAudioElement>(null);
  const fishOn = useRef<HTMLAudioElement>(null);
  const youGotIt = useRef<HTMLAudioElement>(null);

  const toggleAudio = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveStuff = () => {
      const externalLevel = updateProgress(
        fish.current,
        greenBar.current,
        progressBar.current,
        fishOn.current,
        youGotIt.current
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

    const touchDown = () => {
      audio.current?.play();
      down = false;

      if (!animationActive) {
        setAnimate('animate-class');
        animationActive = true;
        setTimeout(() => {
          setAnimate('');
          animationActive = false;
        }, 350);
      }
    };

    const touchUp = () => {
      down = true;
    };

    window.addEventListener('touchstart', touchDown);
    window.addEventListener('touchend', touchUp);
    window.addEventListener('mousedown', touchDown);
    window.addEventListener('mouseup', touchUp);

    return () => {
      cancelAnimationFrame(anim);
      clearInterval(fishNewPositionInterval);
    };
  }, []);

  return (
    <>
      <audio ref={audio} src={'/tune.mp3'} />
      <audio ref={fishOn} src={'/fish-on.mp3'} />
      <audio ref={youGotIt} src={'/you-got-it.mp3'} />
      <div className="fishing">
        <div className="fishing__rod">
          {[...new Array(6)].map((_, idx) => (
            <div key={idx} className="fishing__rod__rod" />
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
            <Seaweed className="seaweed" />
            <div className="bubble animate-bubble" />
            <div
              className="bubble animate-bubble"
              style={{ left: '55%', bottom: '10%', animationDuration: '7s' }}
            />
            <div
              className="bubble animate-bubble"
              style={{ left: '70%', bottom: '7%', animationDuration: '9s' }}
            />

            <div className="dirt" />
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
          {[...new Array(level)].map((_, idx) => (
            <Fish key={idx} className="fish" />
          ))}
        </div>
      </div>
      {/* <div
        className="audio-toggle"
        onClick={() => {
          const el = toggleAudio.current;
          if (el) {
            const className = el.className;
            if (className.includes('animate-toggle-on')) {
              el.className = 'audio-toggle__nub animate-toggle-off';
            } else {
              el.className = 'audio-toggle__nub animate-toggle-on';
            }
          }
        }}
      >
        <div ref={toggleAudio} className="audio-toggle__nub" />
      </div> */}
    </>
  );
};
