import React, { useState, useEffect } from 'react';

interface HSBCIframeProps {
  url: string;
}

const HSBCIframe: React.FC<HSBCIframeProps> = ({ url }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [proxyUrl, setProxyUrl] = useState('');
  const [proxyError, setProxyError] = useState(false);

  // Create the proxied URL
  useEffect(() => {
    console.log('Original URL:', url); // Log the input URL
    // Use the proxy server running on port 30001
    const encodedUrl = encodeURIComponent(url);
    const finalProxyUrl = `http://34.92.201.81:30001?target=${encodedUrl}`;
    console.log('Encoded URL:', encodedUrl); // Log the encoded part
    console.log('Proxy URL:', finalProxyUrl); // Log the final URL
    setProxyUrl(finalProxyUrl);
  }, [url]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    console.error('Failed to load iframe content');
    setProxyError(true);
    setIsLoading(false);
  };

  return (
    <div className="hsbc-iframe-container">
      {isLoading && (
        <div className="hsbc-iframe-loading" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--hsbc-white)',
          zIndex: 2
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: '4px solid var(--hsbc-light-gray)',
              borderTop: '4px solid var(--hsbc-red)',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{
              color: 'var(--hsbc-dark-gray)',
              fontFamily: '"HSBC Univers", Arial, sans-serif',
              fontSize: '16px'
            }}>
              Loading HSBC website through proxy...
            </p>
          </div>
        </div>
      )}

      {proxyError && (
        <div className="hsbc-iframe-error" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--hsbc-white)',
          zIndex: 2,
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '500px'
          }}>
            <h2 style={{ color: 'var(--hsbc-red)', marginBottom: '16px' }}>Proxy Connection Error</h2>
            <p style={{ marginBottom: '12px' }}>
              Unable to load the HSBC website through the proxy server. 
              Please make sure the proxy server is running on port 30001.
            </p>
            <p style={{ marginBottom: '12px' }}>
              Run the following command in your terminal to start the proxy server:
              <br />
              <code style={{
                display: 'block',
                padding: '10px',
                margin: '10px 0',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}>node proxy-server.js</code>
            </p>
            <p style={{ fontSize: '14px', color: 'var(--hsbc-dark-gray)' }}>
              You can still interact with the chatbot interface in the lower right corner.
            </p>
          </div>
        </div>
      )}
      
      {proxyUrl && (
        <iframe 
          src={proxyUrl} 
          className="hsbc-iframe"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title="HSBC Website"
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      )}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default HSBCIframe;
