import React, { useState, useRef, useEffect } from 'react';

// have database folder for videos
export default function Playback() {
    const [PlayButtonText, setPlayButtonText] = useState('Play');
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
        const handleLoaded = () => {
            if (videoRef.current) {
                videoRef.current.playbackRate = rate; // Fixed: lowercase 'p'
            }
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
            videoRef.current.playbackRate = rate; // Fixed: lowercase 'p'
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
    }, [rate]); // Added rate as dependency

    // Fixed: Update playback rate when rate changes
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate; // Fixed: lowercase 'p' and correct property name
        }
    }, [rate]);

    // add an start/end point to the video on button click
    const toggleStart = () => {
        StartRef.current = videoRef.current.currentTime;
    }
    
    const toggleEnd = () => {
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
        try { 
            await videoRef.current.play(); 
        }
        catch { 
            setError('Autoplay blocked. Tap play'); 
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px' }}>Playback</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <label style={{ fontSize: '14px' }}>Speed</label>
                <select 
                    style={{ 
                        border: '1px solid #ccc', 
                        borderRadius: '4px', 
                        padding: '4px 8px', 
                        fontSize: '14px' 
                    }} 
                    value={rate} 
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                >
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(r => (
                        <option key={r} value={r}>{r}x</option>
                    ))}
                </select>

                <button 
                    type="button" 
                    onClick={() => setIsMirrored(s => !s)} 
                    style={{
                        backgroundColor: '#f3f4f6',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                > 
                    {isMirrored ? 'Unmirror' : 'Mirror'} 
                </button>
                
                <button 
                    type="button" 
                    onClick={countDown} 
                    style={{
                        backgroundColor: '#f1f5f9',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}
                > 
                    Start (3-2-1) 
                </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <video 
                    ref={videoRef} 
                    src="src/assets/katseye.mp4" 
                    width="400px" 
                    style={{ 
                        transform: isMirrored ? 'scaleX(-1)' : 'scaleX(1)',
                        marginBottom: '10px',
                        display: 'block'
                    }} 
                    controls
                >
                    Video not supported
                </video>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <button 
                    onClick={togglePlay} 
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {PlayButtonText}
                </button>
                
                <button 
                    onClick={toggleStart} 
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Add Start
                </button>
                
                <button 
                    onClick={toggleEnd} 
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Add End
                </button>
                
                <button 
                    onClick={toggleLoop} 
                    style={{
                        backgroundColor: LoopRef.current ? '#10b981' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    {LoopRef.current ? 'Loop ON' : 'Loop OFF'}
                </button>
            </div>

            {isCountingDown && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 1000
                }}>
                    <div style={{ 
                        color: 'white', 
                        fontSize: '4rem', 
                        fontWeight: 'bold' 
                    }}>
                        {count}
                    </div>
                </div>
            )}
            
            {error && (
                <p style={{ 
                    fontSize: '14px', 
                    color: '#dc2626', 
                    marginTop: '8px' 
                }}>
                    {error}
                </p>
            )}

            <div style={{ 
                backgroundColor: '#f9fafb', 
                padding: '16px', 
                borderRadius: '8px', 
                marginTop: '20px' 
            }}>
                <h2 style={{ 
                    fontSize: '1.5rem', 
                    marginBottom: '16px', 
                    fontWeight: 'bold' 
                }}>
                    Video Status
                </h2>
                <p><strong>Current Speed:</strong> {rate}x</p>
                <p><strong>Start Point:</strong> {StartRef.current.toFixed(2)}s</p>
                <p><strong>End Point:</strong> {EndRef.current === -1 ? 'Not set' : `${EndRef.current.toFixed(2)}s`}</p>
                <p><strong>Looping:</strong> {LoopRef.current ? "Yes" : "No"}</p>
                <p><strong>Current Time:</strong> {VideoTime.toFixed(2)}s</p>
                <p><strong>Mirrored:</strong> {isMirrored ? "Yes" : "No"}</p>
            </div>

            <div style={{ 
                marginTop: '20px', 
                padding: '12px', 
                backgroundColor: '#fef3c7', 
                borderRadius: '6px' 
            }}>
                <p><strong>Todo:</strong> Get countdown to play from StartRef</p>
                <p><strong>Todo:</strong> Toggle countdown instead</p>
                <p><strong>Note:</strong> Variable src video file - need way for users to upload</p>
            </div>
        </div>
    );
}