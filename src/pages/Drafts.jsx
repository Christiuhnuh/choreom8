import React, { useState, useRef, useEffect } from 'react';

// DraftVideo class for managing individual drafts
class DraftVideo {
    constructor(file, title = '', source = 'import') {
        this.id = Date.now() + Math.random();
        this.file = file;
        this.title = title || this.generateDefaultTitle();
        this.dateAdded = new Date();
        this.score = 0;
        this.thumbnail = null;
        this.videoUrl = URL.createObjectURL(file);
        this.source = source;
        this.duration = 0;
        this.fileSize = file.size;
    }

    generateDefaultTitle() {
        const name = this.file.name.replace(/\.[^/.]+$/, "");
        const formatted = name.charAt(0).toUpperCase() + name.slice(1).replace(/[_-]/g, ' ');
        return formatted || 'Dance Draft';
    }

    async generateThumbnail() {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            video.addEventListener('loadeddata', () => {
                canvas.width = 320;
                canvas.height = (video.videoHeight / video.videoWidth) * 320;
                this.duration = video.duration;
                video.currentTime = Math.min(2, video.duration * 0.1);
            });

            video.addEventListener('seeked', () => {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                this.thumbnail = canvas.toDataURL('image/jpeg', 0.8);
                resolve(this.thumbnail);
            });

            video.src = this.videoUrl;
            video.load();
        });
    }

    formatFileSize() {
        const bytes = this.fileSize;
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDuration() {
        if (!this.duration) return '0:00';
        const minutes = Math.floor(this.duration / 60);
        const seconds = Math.floor(this.duration % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Star Rating Component
const StarRating = ({ rating, onRatingChange, draftId }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <div style={{ display: 'flex', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    style={{
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: star <= (hoverRating || rating) ? '#fbbf24' : '#d1d5db',
                        transition: 'color 0.2s'
                    }}
                    onClick={() => onRatingChange(draftId, star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                >
                    ★
                </span>
            ))}
        </div>
    );
};

// Import Modal Component
const ImportVideoModal = ({ isOpen, onClose, onUpload }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files).filter(file => 
            file.type.startsWith('video/')
        );
        setSelectedFiles(files);
    };

    const uploadVideos = async () => {
        if (selectedFiles.length === 0) return;

        setIsUploading(true);
        const uploadedDrafts = [];

        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const draft = new DraftVideo(file, '', 'import');
            
            const progress = ((i + 1) / selectedFiles.length) * 100;
            setUploadProgress(progress);
            
            await draft.generateThumbnail();
            uploadedDrafts.push(draft);
            
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        onUpload(uploadedDrafts);
        setSelectedFiles([]);
        setUploadProgress(0);
        setIsUploading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '30px',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
                    Import Dance Videos
                </h3>
                
                <div 
                    style={{
                        border: '2px dashed #d1d5db',
                        borderRadius: '10px',
                        padding: '40px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        marginBottom: '20px'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
                    <p style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
                        Click to select your dance videos
                    </p>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>
                        Supports MP4, MOV, AVI, and more
                    </p>
                </div>
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />

                {selectedFiles.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <h4 style={{ fontWeight: '500', marginBottom: '10px' }}>Selected Videos:</h4>
                        {selectedFiles.map((file, index) => (
                            <div key={index} style={{ 
                                backgroundColor: '#f9fafb',
                                padding: '10px',
                                borderRadius: '5px',
                                marginBottom: '5px'
                            }}>
                                <p style={{ fontWeight: '500', fontSize: '14px' }}>{file.name}</p>
                                <p style={{ fontSize: '12px', color: '#6b7280' }}>
                                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {isUploading && (
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span>Processing videos...</span>
                            <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <div style={{ 
                            width: '100%', 
                            backgroundColor: '#e5e7eb', 
                            borderRadius: '10px', 
                            height: '8px' 
                        }}>
                            <div style={{ 
                                width: `${uploadProgress}%`, 
                                backgroundColor: '#3b82f6', 
                                height: '100%', 
                                borderRadius: '10px',
                                transition: 'width 0.3s'
                            }}></div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={onClose}
                        disabled={isUploading}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '5px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#e5e7eb',
                            color: '#374151'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={uploadVideos}
                        disabled={selectedFiles.length === 0 || isUploading}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '5px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#3b82f6',
                            color: 'white'
                        }}
                    >
                        {isUploading ? 'Processing...' : `Import ${selectedFiles.length} video${selectedFiles.length !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Draft Card Component
const DraftCard = ({ draft, onTitleChange, onScoreChange, onEdit, onDelete, onPlay }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(draft.title);

    const handleTitleSubmit = () => {
        onTitleChange(draft.id, title.trim() || draft.generateDefaultTitle());
        setIsEditing(false);
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return d.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
        });
    };

    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            marginBottom: '20px'
        }}>
            <div style={{
                width: '100%',
                height: '200px',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
            }}>
                {draft.thumbnail ? (
                    <img 
                        src={draft.thumbnail} 
                        alt={`Thumbnail for ${draft.title}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <>
                        {/* Placeholder with X pattern like your mockup */}
                        <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            backgroundColor: '#e5e7eb',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* X pattern */}
                            <svg style={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '100%' 
                            }}>
                                <line x1="0" y1="0" x2="100%" y2="100%" stroke="#9ca3af" strokeWidth="2"/>
                                <line x1="100%" y1="0" x2="0" y2="100%" stroke="#9ca3af" strokeWidth="2"/>
                            </svg>
                        </div>
                        
                        {/* Duration badge in bottom right */}
                        <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            backgroundColor: 'rgba(0, 0, 0, 0.7)',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}>
                            {draft.formatDuration()}
                        </div>

                        {/* Source badge in top left */}
                        <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            backgroundColor: draft.source === 'camera' ? '#10b981' : '#3b82f6',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: '600'
                        }}>
                            {draft.source === 'camera' ? '📹 Camera' : '📁 Import'}
                        </div>
                    </>
                )}
            </div>

            <div style={{ padding: '16px' }}>
                {isEditing ? (
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={handleTitleSubmit}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') handleTitleSubmit();
                        }}
                        style={{
                            width: '100%',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            border: 'none',
                            borderBottom: '2px solid #3b82f6',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            paddingBottom: '4px'
                        }}
                        autoFocus
                    />
                ) : (
                    <h3 
                        style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            cursor: 'pointer'
                        }}
                        onClick={() => setIsEditing(true)}
                    >
                        {draft.title}
                    </h3>
                )}

                <div style={{ 
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '12px'
                }}>
                    {formatDate(draft.dateAdded)} • {draft.formatFileSize()}
                </div>

                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Your Rating:</span>
                    <StarRating 
                        rating={draft.score} 
                        onRatingChange={onScoreChange}
                        draftId={draft.id}
                    />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => onPlay(draft)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '500',
                            flex: 1
                        }}
                    >
                        ▶️ Play
                    </button>
                    <button
                        onClick={() => onEdit(draft)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            fontSize: '14px',
                            fontWeight: '500',
                            flex: 1
                        }}
                    >
                        ✏️ Edit
                    </button>
                    <button
                        onClick={() => onDelete(draft.id)}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        🗑️
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Drafts Component
export default function Drafts() {
    const [drafts, setDrafts] = useState([]);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState('dateAdded');
    const [filterBy, setFilterBy] = useState('all');

    useEffect(() => {
        const savedDrafts = localStorage.getItem('danceDrafts');
        if (savedDrafts) {
            try {
                const parsedDrafts = JSON.parse(savedDrafts);
                // Make sure we have the methods on the loaded drafts
                const draftsWithMethods = parsedDrafts.map(draftData => ({
                    ...draftData,
                    formatFileSize: function() { 
                        const bytes = this.fileSize || 0;
                        if (bytes === 0) return '0 Bytes';
                        const k = 1024;
                        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                        const i = Math.floor(Math.log(bytes) / Math.log(k));
                        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
                    },
                    formatDuration: function() { 
                        if (!this.duration) return '0:00';
                        const minutes = Math.floor(this.duration / 60);
                        const seconds = Math.floor(this.duration % 60);
                        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                    }
                }));
                setDrafts(draftsWithMethods);
                return; // Don't add sample data if we have saved drafts
            } catch (error) {
                console.error('Error loading drafts:', error);
            }
        }
        
        // Only add sample data if no saved drafts exist
        const sampleDrafts = [
            {
                id: 1,
                title: "Take 1",
                dateAdded: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                score: 4,
                thumbnail: null,
                source: 'camera',
                duration: 45,
                fileSize: 8.5 * 1024 * 1024, // 8.5MB
                formatFileSize: function() { return '8.5 MB'; },
                formatDuration: function() { return '0:45'; }
            },
            {
                id: 2,
                title: "Take 1", 
                dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                score: 3,
                thumbnail: null,
                source: 'import',
                duration: 38,
                fileSize: 7.1 * 1024 * 1024, // 7.1MB
                formatFileSize: function() { return '7.1 MB'; },
                formatDuration: function() { return '0:38'; }
            },
            {
                id: 3,
                title: "Hip Hop Practice",
                dateAdded: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                score: 5,
                thumbnail: null,
                source: 'camera',
                duration: 62,
                fileSize: 12.3 * 1024 * 1024, // 12.3MB
                formatFileSize: function() { return '12.3 MB'; },
                formatDuration: function() { return '1:02'; }
            },
            {
                id: 4,
                title: "Freestyle Session",
                dateAdded: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
                score: 2,
                thumbnail: null,
                source: 'import',
                duration: 28,
                fileSize: 5.8 * 1024 * 1024, // 5.8MB
                formatFileSize: function() { return '5.8 MB'; },
                formatDuration: function() { return '0:28'; }
            }
        ];
        setDrafts(sampleDrafts);
    }, []);

    useEffect(() => {
        if (drafts.length > 0) {
            localStorage.setItem('danceDrafts', JSON.stringify(drafts));
        }
    }, [drafts]);

    const handleImport = (newDrafts) => {
        setDrafts(prev => [...newDrafts, ...prev]);
    };

    const handleTitleChange = (id, newTitle) => {
        setDrafts(prev => prev.map(draft => 
            draft.id === id ? { ...draft, title: newTitle } : draft
        ));
    };

    const handleScoreChange = (id, score) => {
        setDrafts(prev => prev.map(draft => 
            draft.id === id ? { ...draft, score: draft.score === score ? 0 : score } : draft
        ));
    };

    const handleEdit = (draft) => {
        alert(`Edit functionality for "${draft.title}" will be connected to your editing system!`);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this draft?')) {
            setDrafts(prev => prev.filter(draft => draft.id !== id));
        }
    };

    const handlePlay = (draft) => {
        console.log('Playing video:', draft.title);
        // Instead of alert, just log for now to avoid navigation issues
        const playVideo = () => {
            if (draft.videoUrl) {
                // Create a simple video player overlay
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                `;
                
                const videoContainer = document.createElement('div');
                videoContainer.style.cssText = `
                    position: relative;
                    max-width: 90%;
                    max-height: 90%;
                `;
                
                const video = document.createElement('video');
                video.src = draft.videoUrl || '#';
                video.controls = true;
                video.autoplay = true;
                video.style.cssText = `
                    width: 100%;
                    height: auto;
                    max-height: 80vh;
                `;
                
                const closeButton = document.createElement('button');
                closeButton.textContent = '✕ Close';
                closeButton.style.cssText = `
                    position: absolute;
                    top: -40px;
                    right: 0;
                    background: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                `;
                
                closeButton.onclick = () => document.body.removeChild(overlay);
                overlay.onclick = (e) => {
                    if (e.target === overlay) document.body.removeChild(overlay);
                };
                
                videoContainer.appendChild(video);
                videoContainer.appendChild(closeButton);
                overlay.appendChild(videoContainer);
                document.body.appendChild(overlay);
            } else {
                alert(`Playing "${draft.title}". Video playback will be connected to your video system!`);
            }
        };
        
        playVideo();
    };

    // Filter and Sort Logic
    const filteredAndSortedDrafts = drafts
        .filter(draft => {
            if (filterBy === 'all') return true;
            return draft.source === filterBy;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'dateAdded':
                    return new Date(b.dateAdded) - new Date(a.dateAdded);
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'score':
                    return b.score - a.score;
                default:
                    return 0;
            }
        });

    const averageRating = drafts.length > 0 
        ? (drafts.reduce((sum, draft) => sum + draft.score, 0) / drafts.length).toFixed(1)
        : 0;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '32px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
                        My Dance Drafts
                    </h1>
                    <p style={{ color: '#6b7280' }}>
                        {drafts.length} video{drafts.length !== 1 ? 's' : ''} • Average rating: {averageRating} ⭐
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => alert('Camera functionality will be connected!')}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#10b981',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}
                    >
                        📹 Record New
                    </button>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        style={{
                            padding: '12px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}
                    >
                        📁 Import Videos
                    </button>
                </div>
            </div>

            {drafts.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '64px 32px',
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                    <div style={{ fontSize: '96px', marginBottom: '24px' }}>💃</div>
                    <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
                        No dance drafts yet!
                    </h3>
                    <p style={{ color: '#6b7280', marginBottom: '32px', fontSize: '18px' }}>
                        Start by importing videos from your camera roll
                    </p>
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        style={{
                            padding: '16px 32px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            fontSize: '18px',
                            fontWeight: '600'
                        }}
                    >
                        📁 Import First Video
                    </button>
                </div>
            ) : (
                <>
                    {/* Filter and Sort Controls */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '16px', 
                        marginBottom: '24px',
                        backgroundColor: 'white',
                        padding: '16px',
                        borderRadius: '10px',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontWeight: '500', fontSize: '14px' }}>Sort by:</label>
                            <select 
                                value={sortBy} 
                                onChange={(e) => setSortBy(e.target.value)}
                                style={{ 
                                    padding: '4px 8px', 
                                    border: '1px solid #d1d5db', 
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="dateAdded">Date Added</option>
                                <option value="title">Title</option>
                                <option value="score">Rating</option>
                            </select>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <label style={{ fontWeight: '500', fontSize: '14px' }}>Filter:</label>
                            <select 
                                value={filterBy} 
                                onChange={(e) => setFilterBy(e.target.value)}
                                style={{ 
                                    padding: '4px 8px', 
                                    border: '1px solid #d1d5db', 
                                    borderRadius: '6px',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="all">All Videos</option>
                                <option value="camera">Camera Recordings</option>
                                <option value="import">Imported Videos</option>
                            </select>
                        </div>

                        <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#6b7280' }}>
                            Showing {filteredAndSortedDrafts.length} of {drafts.length} videos
                        </div>
                    </div>

                    {/* Drafts Grid */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: '24px'
                    }}>
                        {filteredAndSortedDrafts.map(draft => (
                            <DraftCard
                                key={draft.id}
                                draft={draft}
                                onTitleChange={handleTitleChange}
                                onScoreChange={handleScoreChange}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onPlay={handlePlay}
                            />
                        ))}
                    </div>
                </>
            )}

            <ImportVideoModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onUpload={handleImport}
            />
        </div>
    );
}