import * as React from 'react';
import { useState, useEffect } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';

import { listLogEntries } from './Api';

const App = () => {
  const [logEntries, setLogEntries] = useState([]);
  const [showPopup, setShowPopup] = useState({});
  const [viewport, setViewport] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 37.6,
    longitude: -95.4376,
    zoom: 3
  });

  useEffect(() => {
    (async () => {
      const logEntries = await listLogEntries();
      setLogEntries(logEntries)
    })();
  }, []);

  return (
    <ReactMapGL
      {...viewport}
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
      onViewportChange={nextViewport => setViewport(nextViewport)}
    >
      {
        logEntries.map(entry => {
          return (
          <React.Fragment key={entry._id}>
            <Marker 
              latitude={entry.latitude} 
              longitude={entry.longitude}
            >
              <div
                onClick={() => setShowPopup({
                  [entry._id]: true,
                })}>
                <img 
                  className="marker" 
                  style={{
                    height: `${6 * viewport.zoom}px`,
                    width: `${6 * viewport.zoom}px`,
                  }}
                  src="https://i.imgur.com/y0G5YTX.png" 
                  alt="marker" />
              </div>
            </Marker>
            {
              showPopup[entry._id] ? (
                <Popup
                  latitude={entry.latitude} 
                  longitude={entry.longitude}
                  closeButton={true}
                  closeOnClick={false}
                  dynamicPosition={true}
                  onClose={() => setShowPopup({})}
                  anchor="top" >
                  <div className="popup">
                    <h3>{entry.title}</h3>
                    <p>{entry.comments}</p>
                    <small>Visited on: {new Date(entry.visitDate).toLocaleDateString()}</small>
                  </div>
                </Popup> )
                : null
            }
          </React.Fragment>
          )
        })
      }
    </ReactMapGL>
  );
}

export default App;
