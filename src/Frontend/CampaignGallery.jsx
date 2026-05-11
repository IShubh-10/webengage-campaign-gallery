import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  ExternalLink, 
  Code, 
  Layout, 
  Tag, 
  Copy, 
  Check, 
  Trash2, 
  X, 
  FileCode, 
  Eye, 
  Edit3, 
  RefreshCw, 
  Terminal, 
  Monitor, 
  Smartphone, 
  Tablet as TabletIcon,
  Link,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const CAMPAIGN_TYPES = ['Email', 'onsite notification', 'onsite survey', 'In App', 'webp', 'CWC'];

const VIEWPORTS = {
  desktop: { name: 'Desktop', width: '100%', icon: Monitor },
  tablet: { name: 'Tablet', width: '768px', icon: TabletIcon },
  mobile: { name: 'Mobile', width: '375px', icon: Smartphone }
};


const API_BASE_URL = import.meta.env.VITE_API_URL;; 

export default function App() {
  const [view, setView] = useState('gallery');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [copyingId, setCopyingId] = useState(null);
  const [previewCampaign, setPreviewCampaign] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [activeViewport, setActiveViewport] = useState('desktop');

  // Multi-page state management
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [formData, setFormData] = useState({
    type: 'Email',
    title: '',
    tags: '',
    asanaLink: '',
    code: '',
    pages: [''] // Array to hold survey pages
  });

  const fetchCampaigns = async (retries = 5, delay = 1000) => {
    if (!API_BASE_URL) {
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      const data = await response.json();
      
      const formattedData = data.map(c => {
        let pages = [''];
        try {
          // If it's a survey and the code is JSON, parse the pages
          if (c.type === 'onsite survey' && c.code && c.code.trim().startsWith('{')) {
            const parsed = JSON.parse(c.code);
            pages = parsed.pages || [c.code];
          } else {
            pages = [c.code || ''];
          }
        } catch (e) {
          pages = [c.code || ''];
        }

        return {
          ...c,
          tags: typeof c.tags === 'string' ? c.tags.split(',').map(t => t.trim()).filter(Boolean) : (c.tags || []),
          pages: pages
        };
      });
      
      setCampaigns(formattedData);
      setLoading(false);
      setError(null);
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => fetchCampaigns(retries - 1, delay * 2), delay);
      } else {
        setError('Could not connect to the server. Please check if your backend is running.');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'All' || (c.tags && c.tags.includes(selectedTag));
    const matchesType = selectedType === 'All' || c.type === selectedType;
    return matchesSearch && matchesTag && matchesType;
  });

  const handleCopy = (code, id) => {
    const textArea = document.createElement("textarea");
    textArea.value = code;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    setCopyingId(id);
    setTimeout(() => setCopyingId(null), 2000);
    document.body.removeChild(textArea);
  };

  const startEdit = (campaign) => {
    setFormData({
      type: campaign.type,
      title: campaign.title,
      tags: Array.isArray(campaign.tags) ? campaign.tags.join(', ') : campaign.tags,
      asanaLink: campaign.asanaLink,
      code: campaign.code,
      pages: campaign.pages || [campaign.code || '']
    });
    setEditingId(campaign.id);
    setActivePageIndex(0);
    setView('admin');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      setCampaigns(campaigns.filter(c => c.id !== id));
    } catch (err) {
      setError('Failed to delete campaign');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!API_BASE_URL) return;

    let finalCode = formData.code;
    if (formData.type === 'onsite survey') {
      finalCode = JSON.stringify({ pages: formData.pages });
    }

    const campaignData = {
      type: formData.type,
      title: formData.title,
      tags: formData.tags,
      asanaLink: formData.asanaLink,
      code: finalCode
    };

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${API_BASE_URL}/${editingId}` : API_BASE_URL;

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });
      if (!response.ok) throw new Error('Save failed');
      fetchCampaigns();
      setView('gallery');
      setEditingId(null);
    } catch (err) {
      setError('Failed to save campaign. Check backend connection.');
    }
  };

  // Multi-page helper functions
  const addPage = () => {
    const newPages = [...formData.pages, ''];
    setFormData({ ...formData, pages: newPages });
    setActivePageIndex(newPages.length - 1);
  };

  const removePage = (index) => {
    if (formData.pages.length <= 1) return;
    const newPages = formData.pages.filter((_, i) => i !== index);
    setFormData({ ...formData, pages: newPages });
    setActivePageIndex(Math.max(0, index - 1));
  };

  const updateCurrentPageCode = (val) => {
    const newPages = [...formData.pages];
    newPages[activePageIndex] = val;
    setFormData({ ...formData, pages: newPages });
  };

  const generateIframeContent = (content) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; padding: 20px; display: flex; justify-content: center; background: #f8fafc; font-family: sans-serif; }
          </style>
        </head>
        <body>${content || ''}</body>
      </html>
    `;
  };

  const handleLogout = () => {
    localStorage.removeItem("isLogedIn");
    window.location.reload();
  };

  return (
    <div className="app-container">
      <style>{`
        :root { --primary: #5d46b1; --bg: #f8fafc; --white: #ffffff; --border: #e2e8f0; --text: #1e293b; --radius: 12px; }
        body { margin: 0; font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); }
        .navbar { background: white; border-bottom: 1px solid var(--border); padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
        .logo { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-weight: 800; font-size: 1.25rem; }
        .logo span { color: var(--primary); }
        .main-content { max-width: 100%; margin: 2rem auto; padding: 0 1rem; }
        .filter-bar { background: white; padding: 1.25rem; border-radius: var(--radius); border: 1px solid var(--border); display: flex; gap: 1rem; margin-bottom: 2rem; align-items: center; }
        .input { width: -webkit-fill-available;flex: 1; padding: 0.6rem 1rem; border: 1px solid var(--border); border-radius: 8px; outline: none; }
        .campaign-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .card { background: white; border-radius: var(--radius); border: 1px solid var(--border); overflow: hidden; transition: transform 0.2s; display: flex; flex-direction: column; position: relative; }
        .card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .card-body { padding: 1.5rem; flex: 1; }
        .card-title { font-size: 1.1rem; font-weight: 700; margin: 10px 0; min-height: 2.2rem; }
        .card-meta { display: flex; justify-content: space-between; font-size: 0.75rem; color: #64748b; margin-top: 15px; }
        .btn { padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; display: flex; align-items: center; gap: 0.5rem; justify-content: center; transition: all 0.2s; }
        .btn-primary { background: var(--primary); color: white; }
        .btn-ghost { background: transparent; color: #64748b; border: 1px solid var(--border); }
        .card-footer { padding: 1rem; background: #f8fafc; box-shadow: 0 -12px 20px rgba(93, 70, 177, 0.18); display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
        .admin-view { background: white; border-radius: var(--radius); border: 1px solid var(--border); display: flex; min-height: 700px; }
        .form-panel { width: 50%; padding: 2rem; border-right: 1px solid var(--border); overflow-y: auto; }
        .preview-panel { width: 50%; padding: 2rem; background: #f1f5f9; display: flex; flex-direction: column; }
        .vp-header { display: flex; justify-content: space-between; margin-bottom: 1rem; align-items: center; }
        .vp-toggle { display: flex; gap: 4px; background: white; padding: 4px; border-radius: 8px; border: 1px solid var(--border); }
        .vp-btn { padding: 6px; border: none; background: none; cursor: pointer; color: #64748b; border-radius: 4px; }
        .vp-btn.active { background: #eef2ff; color: var(--primary); }
        .preview-frame-container { flex: 1; display: flex; justify-content: center; overflow: hidden; background: #cbd5e1; border-radius: 8px; padding: 1rem; }
        .preview-frame { background: white; border: none; height: 100%; transition: width 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .page-tabs { display: flex; gap: 4px; margin-bottom: 8px; }
        .page-tab { padding: 4px 10px; font-size: 0.7rem; background: #f1f5f9; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px; border: 1px solid var(--border); }
        .page-tab.active { background: var(--primary); color: white; border-color: var(--primary); }
      `}</style>

      <nav className="navbar">
        <div className="logo" onClick={() => setView('gallery')}>
          <div style={{color: 'white', padding: '6px', borderRadius: '8px'}}><img width={30} src='data:image/jpeg;base64,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' /></div>
          <div>Campaign<span>Hub</span></div>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button onClick={() => setView('gallery')} className={`btn ${view === 'gallery' ? 'btn-primary' : 'btn-ghost'}`}>Gallery</button>
          <button onClick={() => { setEditingId(null); setFormData({type: 'Email', title: '', tags: '', asanaLink: '', code: '', pages: ['']}); setView('admin'); }} className="btn btn-primary"><Plus size={18}/> New</button>
          <button onClick={handleLogout} className="btn btn-ghost">Logout</button>
        </div>
      </nav>

      <main className="main-content">
        {view === 'gallery' ? (
          <>
            <div className="filter-bar">
              <Search size={18} color="#64748b"/>
              <input className="input" placeholder="Search campaigns..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <select className="input" style={{maxWidth: '150px'}} value={selectedType} onChange={e => setSelectedType(e.target.value)}>
                <option value="All">All Types</option>
                {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {loading ? (
              <div className="loading-state">
                <RefreshCw size={32} className="animate-spin" style={{margin: '0 auto 1rem'}}/>
                <p>Loading campaigns from server...</p>
              </div>
            ) : (
              <div className="campaign-grid">
                {filteredCampaigns.map(c => (
                  <div key={c.id} className="card">
                    <div className="card-body">
                      <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <span style={{fontSize: '0.65rem', fontWeight: 800, background: '#eef2ff', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase'}}>{c.type}</span>
                        <button onClick={() => handleDelete(c.id)} style={{border: 'none', background: 'none', color: '#cbd5e1', cursor: 'pointer'}} title="Delete" className="delete-btn">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                      <h3 className="card-title">{c.title}</h3>
                      <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px'}}>
                        {Array.isArray(c.tags) && c.tags.map(t => <span key={t} style={{fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px'}}>#{t}</span>)}
                      </div>
                      <div className="card-meta">
                        <span>{new Date(c.date || Date.now()).toLocaleDateString()}</span>
                        {c.asanaLink && <a href={c.asanaLink} target="_blank" rel="noreferrer" style={{color: 'var(--primary)'}} title="Open Asana Task"><ExternalLink size={14}/></a>}
                      </div>
                    </div>
                    <div className="card-footer">
                      <button className="btn btn-ghost" style={{padding: '8px', fontSize: '0.75rem'}} onClick={() => { setActivePageIndex(0); setPreviewCampaign(c); }} title="Full Preview"><Eye size={14}/></button>
                      <button className="btn btn-ghost" style={{padding: '8px', fontSize: '0.75rem'}} onClick={() => startEdit(c)} title="Edit Campaign"><Edit3 size={14}/></button>
                      <button className={`btn ${copyingId === c.id ? 'btn-primary' : 'btn-ghost'}`} style={{padding: '8px', fontSize: '0.75rem'}} onClick={() => handleCopy(c.type === 'onsite survey' ? (c.pages?.[0] || "") : c.code, c.id)} title="Copy Code">
                        {copyingId === c.id ? <Check size={14}/> : <Copy size={14}/>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="admin-view">
            <div className="form-panel">
              <h2 style={{marginTop: 0, fontSize: '1.25rem'}}>{editingId ? 'Edit Campaign' : 'Create New Campaign'}</h2>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem'}}>
                <div>
                  <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem'}}>Campaign Type</label>
                  <select className="input" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                    {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem'}}>Campaign Title</label>
                  <input className="input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Summer Promo 2024" />
                </div>
              </div>
              
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem'}}>
                <div>
                    <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem'}}>Tags (comma separated)</label>
                    <input className="input" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="Holiday, Mobile, Product" />
                </div>
                <div>
                    <label style={{display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem'}}>Asana Task Link</label>
                    <input className="input" value={formData.asanaLink} onChange={e => setFormData({...formData, asanaLink: e.target.value})} placeholder="https://app.asana.com/..." />
                </div>
              </div>

              <div style={{marginBottom: '1.5rem'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem'}}>
                  <label style={{fontSize: '0.8rem', fontWeight: 700}}>HTML/CSS Code</label>
                  {formData.type === 'onsite survey' && (
                    <div className="page-tabs">
                      {formData.pages.map((_, i) => (
                        <div key={i} className={`page-tab ${activePageIndex === i ? 'active' : ''}`} onClick={() => setActivePageIndex(i)}>
                          P{i+1}
                          {formData.pages.length > 1 && <X size={10} onClick={(e) => { e.stopPropagation(); removePage(i); }}/>}
                        </div>
                      ))}
                      <button className="page-tab" onClick={addPage}><Plus size={10}/></button>
                    </div>
                  )}
                </div>
                <textarea 
                  className="input" 
                  style={{height: '350px', fontFamily: 'monospace', fontSize: '0.8rem', background: '#0f172a', color: 'darkcyan', lineHeight: '1.5'}} 
                  value={formData.type === 'onsite survey' ? formData.pages[activePageIndex] : formData.code} 
                  onChange={e => formData.type === 'onsite survey' ? updateCurrentPageCode(e.target.value) : setFormData({...formData, code: e.target.value})} 
                  spellCheck="false" 
                />
              </div>
              <div style={{display: 'flex', gap: '1rem'}}>
                <button className="btn btn-primary" style={{flex: 1}} onClick={handleSubmit}>Save Changes</button>
                <button className="btn btn-ghost" style={{flex: 1}} onClick={() => setView('gallery')}>Cancel</button>
              </div>
            </div>
            <div className="preview-panel">
              <div className="vp-header">
                <span style={{fontSize: '0.75rem', fontWeight: 700, color: '#64748b'}}>VIEWPORT PREVIEW</span>
                <div className="vp-toggle">
                  {Object.entries(VIEWPORTS).map(([key, vp]) => (
                    <button key={key} className={`vp-btn ${activeViewport === key ? 'active' : ''}`} onClick={() => setActiveViewport(key)} title={vp.name}>
                      <vp.icon size={16}/>
                    </button>
                  ))}
                </div>
              </div>
              <div className="preview-frame-container">
                <iframe 
                  className="preview-frame" 
                  style={{width: VIEWPORTS[activeViewport].width}} 
                  srcDoc={generateIframeContent(formData.type === 'onsite survey' ? formData.pages[activePageIndex] : formData.code)} 
                  title="Live Preview"
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {previewCampaign && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem'}} onClick={() => setPreviewCampaign(null)}>
          <div style={{background: 'white', borderRadius: '16px', width: '100%', maxWidth: '900px', height: '85vh', display: 'flex', flexDirection: 'column'}} onClick={e => e.stopPropagation()}>
            <div style={{padding: '1.25rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div>
                <h3 style={{margin: 0}}>{previewCampaign.title}</h3>
                <span style={{fontSize: '0.7rem', color: '#64748b'}}>{previewCampaign.type} • {new Date(previewCampaign.date).toLocaleDateString()}</span>
              </div>
              <button style={{background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%'}} onClick={() => setPreviewCampaign(null)}><X size={20}/></button>
            </div>
            <div style={{flex: 1, background: '#cbd5e1', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'hidden'}}>
              
              {previewCampaign.type === 'onsite survey' && (
                <div className="page-tabs" style={{marginBottom: '10px'}}>
                   {previewCampaign.pages?.map((_, i) => (
                    <div key={i} className={`page-tab ${activePageIndex === i ? 'active' : ''}`} onClick={() => setActivePageIndex(i)}>
                      Page {i+1}
                    </div>
                  ))}
                </div>
              )}

              <iframe className="preview-frame" style={{width: '100%', maxWidth: '600px'}} srcDoc={generateIframeContent(previewCampaign.type === 'onsite survey' ? previewCampaign.pages?.[activePageIndex] : previewCampaign.code)} title="Full View" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}