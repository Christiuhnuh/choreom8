import React, { useState, useRef, useEffect } from 'react';

// have database folder for videos
export default function Playback() {
    const [PlayButtonText, setPlayButtonText] = useState('Play');
    // const [Start, setStart] = useState(0);
    // const [End, setEnd] = useState(5);
    // const [Looping, setLooping] = useState(false);
    const [VideoTime, setVideoTime] = useState(0);

    const [rate, setRate] = useState(1);
    const [isMirrored, setIsMirrored] = useState(false);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [count, setCount] = useState(3);
    const [error, setError] = useState('');

    const videoRef = useRef(null);
    const countDownSeconds = 3;
    const EndRef = useRef(-1);
    const StartRef = useRef(0);
    const LoopRef = useRef(false);

    // change play/pause button text whenever the video updates
    const updatePlayText = () => {
        if (videoRef.current.paused) {
            setPlayButtonText("Play");
        } else {
            setPlayButtonText("Pause");
        }
    };

    // play/pause video when button clicked
    const togglePlay = () => {
        if (videoRef.current.paused) {
            videoRef.current.play();
        } else {
            videoRef.current.pause();
        }
        updatePlayText();
    };

    // update button text when video controls are used
    // add event listener for looping
    useEffect(() => {
        // const handlePlay = () => {
        //     setButtonText("Pause");
        // };
        // const handlePause = () => {
        //     setButtonText("Play");
        // };
        const handleLoaded = () => {
            videoRef.current.PlaybackRate = rate;
        }

        // Add event listener to the referenced element
        const handleTimeUpdate = () => {
            const currentTime = videoRef.current.currentTime;
            setVideoTime(currentTime);

            if (EndRef.current != -1 && currentTime >= EndRef.current - 0.10 && !videoRef.current.paused) {  // 0.05s = 50ms margin
                if (LoopRef.current) {
                    videoRef.current.currentTime = StartRef.current;
                } else {
                    videoRef.current.pause();
                    videoRef.current.currentTime = EndRef.current;
                }
            }
        }

        if (videoRef.current) {
            videoRef.current.addEventListener('click', updatePlayText);
            videoRef.current.addEventListener('play', updatePlayText);
            videoRef.current.addEventListener('pause', updatePlayText);
            videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
            videoRef.current.addEventListener('loadedmetadata', handleLoaded);
            videoRef.current.PlaybackRate = rate;
        }

        // Clean up the event listener when the component unmounts
        return () => {
            if (videoRef.current) {
                videoRef.current.removeEventListener('click', updatePlayText);
                videoRef.current.removeEventListener('play', updatePlayText);
                videoRef.current.removeEventListener('pause', updatePlayText);
                videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
                videoRef.current.removeEventListener('loadedmetadata', handleLoaded);
            }
        };
    }, [VideoTime, EndRef, StartRef, LoopRef]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.Playback = rate;
        }
    }, [rate]);

    // add an start/end point to the video on button click
    const toggleStart = () => {
        StartRef.current = videoRef.current.currentTime;
    }
    const toggleEnd = () => {
        // setEnd(videoRef.current.currentTime);
        EndRef.current = videoRef.current.currentTime;
    };

    // toggle looping
    const toggleLoop = () => {
        LoopRef.current = !LoopRef.current;
    }

    const countDown = async () => {
        if (!videoRef.current) return;
        setError('');
        setIsCountingDown(true);
        for (let i = countDownSeconds; i > 0; i--) {
            setCount(i);
            await new Promise(res => setTimeout(res, 1000));
        }
        setIsCountingDown(false);
        try { await videoRef.current.play(); }
        catch { setError('Autoplay blocked. Tap play'); }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold">Playback</h1>
            <div className="flex items-center gap-2 my-2">
                <label className="text-sm">Speed</label>
                <select className="border rounded px-2 py-1 text-sm" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}>
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(r => (
                        <option key={r} value={r}>{r}x</option>
                    ))}
                </select>

                <button type="button" onClick={() => setIsMirrored(s => !s)} className="bg-gray-100 hover:bg-gray-200 text-black font-semibold py-1 px-3 rounded"> {isMirrored ? 'Unmirror' : 'Mirror'} </button>
                <button type="button" onClick={countDown} className="bg-slate-100 hover:bg-slate-200 text-black font-semibold py-2 px-3 rounded"> Start (3-2-1) </button>

            </div>

            <video ref={videoRef} src="src/assets/katseye.mp4" width="200px" id="playbackvid" style={{ transform: isMirrored ? 'scaleX(-1)' : 'scaleX(1)' }} controls>video here</video>
            <button type="submit" value="submit" id="playpause" onClick={togglePlay} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">{PlayButtonText}</button>
            <button type="submit" value="submit" id="togglestart" onClick={toggleStart} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add start</button>
            <button type="submit" value="submit" id="toggleend" onClick={toggleEnd} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Add end</button>
            <button type="submit" value="submit" id="toggleloop" onClick={toggleLoop} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Toggle Loop</button>
            {isCountingDown && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <div className="text-white text-5xl font-bold">{count}</div>
                </div>
            )}
            {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
            <p>variable src video file? need to make some way for users to upload :/</p>

            <h2 className="text-2xl mb-4 mt-6">Status of video playback!</h2>
            <p>Start of Video: {StartRef.current}</p>
            <p>End of Video: {EndRef.current}</p>
            <p>Looping?: {LoopRef.current ? "yes" : "no"}</p>
            <p>Current Time: {VideoTime}</p>

            <p className="mt-5">todo: get countdown to play from StartRef?</p>
            <p>todo: toggle countdown instead?</p>
        </div>
    );
}
