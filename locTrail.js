const map = new ol.Map({
    target: 'map-container',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.OSM()
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([77.1025, 28.7041]),
        zoom: 2
    })
});

const start = document.querySelector('#start');
const source = new ol.source.Vector();
const layer = new ol.layer.Vector({
    source: source
});

//creating bluetooth buttons

const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');

const colourPicker = document.getElementById('colourPicker');
const colourButton = document.getElementById('colourButton');

const connect = document.getElementById('connect');
const deviceHeartbeat = document.getElementById('deviceHeartbeat');

//bluetooth buttons created.

//enabling services to send and recievethe data.

const primaryServiceUuid = '12345678-1234-5678-1234-56789abcdef0';
const receiveCharUuid = '12345678-1234-5678-1234-56789abcdef1';
const sendCharUuid = '12345678-1234-5678-1234-56789abcdef3';
// services enabled.

//declaring code to establish the bluetooth connection

let device, sendCharacteristic, receiveCharacteristic;
connectButton.onclick = async () => {
  device = await navigator.bluetooth
            .requestDevice({ 
                acceptAllDevices: true
            });

  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(primaryServiceUuid);

  receiveCharacteristic = await service.getCharacteristic(receiveCharUuid);
  sendCharacteristic = await service.getCharacteristic(sendCharUuid);

  device.ongattserverdisconnected = disconnect;

  connected.style.display = 'block';
  connectButton.style.display = 'none';
  disconnectButton.style.display = 'initial';
};

//bluetooth connection established.

//code to disconnect the bluetooth

const disconnect = () => {
  device = null;
  receiveCharacteristic = null;
  sendCharacteristic = null;

  connected.style.display = 'none';
  connectButton.style.display = 'initial';
  disconnectButton.style.display = 'none';
  
};
disconnectButton.onclick = async () => {
  await device.gatt.disconnect();
  disconnect();

};
//code to disconnect declared.



start.addEventListener('click', geoTrack); 

function geoTrack() {
    map.addLayer(layer);

    // removing footer text
    document.querySelector('#text').remove();

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(function (pos) {
            const coords = [pos.coords.longitude, pos.coords.latitude];
            const accuracy = new ol.geom.Polygon(coords, pos.coords.accuracy);
    
            // adding location trail
            const div = document.createElement('div');
            div.className = 'alert alert-info';
            div.innerHTML = `<strong>Latitude:</strong> ${pos.coords.latitude} <strong>Longitude:</strong> ${pos.coords.longitude} <strong>Date/Time:</strong> ${Date()}`;
            document.querySelector('#card-footer').insertBefore(div, document.querySelector('.alert'));
    
            source.clear(true);
            source.addFeatures([
                new ol.Feature(accuracy.transform('EPSG:4326', map.getView().getProjection())),
                new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(coords)))
            ]);
    
            if (!source.isEmpty()) {
                map.getView().fit(source.getExtent(), {
                    maxZoom: 16,
                    duration: 500
                });
            }
            
        }, function (error) {
            const div = document.createElement('div');
            div.className = 'alert alert-danger mt-3';
            div.innerHTML = `ERROR: ${error.message} Please refresh and start again.`;
            document.querySelector('#card-body').append(document.querySelector('#map-container'), div);
        }, {
            enableHighAccuracy: true,
            maximumAge: 10000
        });
    
        // Locate button on map
        const locate = document.createElement('div');
        locate.className = 'ol-control ol-unselectable locate';
        locate.innerHTML = '<button id="locate" title="Locate me">◎</button>';
        locate.addEventListener('click', function () {
            if (!source.isEmpty()) {
                map.getView().fit(source.getExtent(), {
                    maxZoom: 16,
                    duration: 500
                });
            }
        });
        map.addControl(new ol.control.Control({
            element: locate
        }));
    } else {
        alert('Geolocation is not supported in this browser, Please try another browser.');
    }
    
}