import React, { useState, useCallback, useEffect } from 'react';
import './LocalAssetBrowser.css';

const LocalAssetBrowser = ({ onImport, onClose }) => {
    const [directoryHandle, setDirectoryHandle] = useState(null);
    const [localFiles, setLocalFiles] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [globalTag, setGlobalTag] = useState('');

    const browseFolder = async () => {
        try {
            const handle = await window.showDirectoryPicker();
            setDirectoryHandle(handle);
            loadFiles(handle);
        } catch (error) {
            console.error('Error picking directory:', error);
        }
    };

    const loadFiles = async (handle) => {
        setLoading(true);
        const files = [];
        try {
            for await (const entry of handle.values()) {
                if (entry.kind === 'file') {
                    const file = await entry.getFile();
                    if (file.type.startsWith('image/')) {
                        files.push({
                            name: entry.name,
                            file: file,
                            preview: URL.createObjectURL(file),
                            tag: '',
                            handle: entry
                        });
                    }
                }
            }
            setLocalFiles(files);
            setSelectedFiles(new Set());
        } catch (error) {
            console.error('Error loading files:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (index) => {
        const newSelected = new Set(selectedFiles);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedFiles(newSelected);
    };

    const selectAll = () => {
        if (selectedFiles.size === localFiles.length) {
            setSelectedFiles(new Set());
        } else {
            const all = new Set(localFiles.map((_, i) => i));
            setSelectedFiles(all);
        }
    };

    const updateTag = (index, tag) => {
        const updated = [...localFiles];
        updated[index].tag = tag;
        setLocalFiles(updated);
    };

    const applyGlobalTag = () => {
        const updated = localFiles.map((file, i) => {
            if (selectedFiles.has(i)) {
                return { ...file, tag: globalTag };
            }
            return file;
        });
        setLocalFiles(updated);
        setGlobalTag('');
    };

    const handleImport = () => {
        const filesToImport = localFiles.filter((_, i) => selectedFiles.has(i));
        onImport(filesToImport);
    };

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            localFiles.forEach(f => URL.revokeObjectURL(f.preview));
        };
    }, [localFiles]);

    return (
        <div className="local-browser-overlay">
            <div className="local-browser-container">
                <div className="local-browser-header">
                    <h3>📂 Local System Asset Browser</h3>
                    <div className="header-actions">
                        <button onClick={browseFolder} className="browser-btn secondary">
                            {directoryHandle ? 'Change Folder' : 'Open Folder'}
                        </button>
                        <button onClick={onClose} className="close-btn">✕</button>
                    </div>
                </div>

                {directoryHandle ? (
                    <div className="browser-body">
                        <div className="bulk-toolbar">
                            <div className="selection-stats">
                                {selectedFiles.size} of {localFiles.length} images selected
                                <button onClick={selectAll} className="text-btn">
                                    {selectedFiles.size === localFiles.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            <div className="bulk-group">
                                <input
                                    type="text"
                                    placeholder="Bulk tag selected..."
                                    value={globalTag}
                                    onChange={(e) => setGlobalTag(e.target.value)}
                                />
                                <button onClick={applyGlobalTag} disabled={selectedFiles.size === 0}>Apply Tag</button>
                                <button
                                    onClick={handleImport}
                                    className="import-btn"
                                    disabled={selectedFiles.size === 0}
                                >
                                    📥 Import Selected
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="browser-loading">Scanning folder...</div>
                        ) : (
                            <div className="asset-grid">
                                {localFiles.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className={`asset-card ${selectedFiles.has(idx) ? 'selected' : ''}`}
                                        onClick={() => toggleSelect(idx)}
                                    >
                                        <div className="asset-preview">
                                            <img src={item.preview} alt={item.name} />
                                            <div className="asset-checkbox">
                                                {selectedFiles.has(idx) && '✓'}
                                            </div>
                                        </div>
                                        <div className="asset-info" onClick={(e) => e.stopPropagation()}>
                                            <span className="asset-name" title={item.name}>{item.name}</span>
                                            <input
                                                type="text"
                                                placeholder="Tag/Description"
                                                value={item.tag}
                                                onChange={(e) => updateTag(idx, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {localFiles.length === 0 && (
                                    <div className="empty-state">No images found in this folder.</div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="welcome-state">
                        <div className="welcome-icon">📂</div>
                        <h4>Access Local Photos</h4>
                        <p>Select a folder on your computer to browse and import photos directly into the NNSC Gallery.</p>
                        <button onClick={browseFolder} className="browser-btn primary large">
                            Select Photo Folder
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LocalAssetBrowser;
