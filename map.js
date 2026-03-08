// Haritayı başlat
var map = L.map('map').setView([40.9, 39.7], 10);

// Altlık Haritalar (Basemaps)
var osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri'
});

// İkonları türe göre belirlemek için yardımcı fonksiyon
function getIconForType(tur) {
    let iconHtml = '<i class="fas fa-map-marker-alt" style="color: #2980b9;"></i>'; // Varsayılan
    
    if (tur === 'CAMI') {
        iconHtml = '<i class="fas fa-mosque" style="color: #27ae60;"></i>';
    } else if (tur === 'KILISE' || tur === 'SAPEL' || tur === 'KILISE/CAMI/MUZE') {
        iconHtml = '<i class="fas fa-church" style="color: #8e44ad;"></i>';
    } else if (tur === 'KALE' || tur === 'KULE/CEPHANELIK') {
        iconHtml = '<i class="fab fa-fort-awesome" style="color: #c0392b;"></i>';
    } else if (tur === 'SELALE' || tur === 'GOL') {
        iconHtml = '<i class="fas fa-water" style="color: #2980b9;"></i>';
    } else if (tur === 'HAN' || tur === 'SU KEMERI' || tur === 'KOPRU') {
        iconHtml = '<i class="fas fa-archway" style="color: #d35400;"></i>';
    } else if (tur === 'MUZE' || tur === 'KONUT') {
        iconHtml = '<i class="fas fa-building" style="color: #f39c12;"></i>';
    }

    return L.divIcon({
        className: 'custom-div-icon',
        html: iconHtml,
        iconSize: [30, 42],
        iconAnchor: [15, 42]
    });
}

// Katman Grupları (Lejant için)
var layers = {
    "Camiler": L.layerGroup(),
    "Kiliseler ve Manastırlar": L.layerGroup(),
    "Kaleler": L.layerGroup(),
    "Doğal Güzellikler (Şelale/Göl)": L.layerGroup(),
    "Diğer Tarihi Yapılar (Han/Köprü/Müze)": L.layerGroup()
};

// GeoJSON verisini çekme [cite: 228]
fetch('trabzon_turizm.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                var tur = feature.properties.TUR;
                var marker = L.marker(latlng, { icon: getIconForType(tur) });
                
                // Resim yolunu temizleyip sadece dosya adını alma
                var resimYolu = feature.properties.RESİM;
                var resimHtml = '';
                
                if (resimYolu && resimYolu !== "null") {
                    var dosyaAdi = resimYolu.split('\\').pop(); 
                    resimHtml = `
                        <div style="margin-top: 10px;">
                            <img src="resimler/${dosyaAdi}" alt="${feature.properties.ADI}" style="width: 100%; max-height: 160px; object-fit: cover; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
                        </div>
                    `;
                }

                // Popup İçeriği oluşturma
                var popupContent = `
                    <div style="text-align:center; min-width: 200px; font-family: 'Segoe UI', sans-serif;">
                        <h3 style="margin-top: 0; margin-bottom:10px; border-bottom: 2px solid #3498db; padding-bottom: 5px; color: #2c3e50;">
                            ${feature.properties.ADI || 'Bilinmeyen İsim'}
                        </h3>
                        <strong>Tür:</strong> ${feature.properties.TUR || '-'}<br>
                        <strong>İlçe:</strong> ${feature.properties.ILCE || '-'}<br>
                        <strong>Mahalle:</strong> ${feature.properties.MAHALLE || '-'}<br>
                        ${resimHtml}
                    </div>
                `;
                marker.bindPopup(popupContent);

                // İlgili katmana ekleme
                if (tur === 'CAMI') {
                    layers["Camiler"].addLayer(marker);
                } else if (tur === 'KILISE' || tur === 'SAPEL' || tur === 'KILISE/CAMI/MUZE') {
                    layers["Kiliseler ve Manastırlar"].addLayer(marker);
                } else if (tur === 'KALE' || tur === 'KULE/CEPHANELIK') {
                    layers["Kaleler"].addLayer(marker);
                } else if (tur === 'SELALE' || tur === 'GOL') {
                    layers["Doğal Güzellikler (Şelale/Göl)"].addLayer(marker);
                } else {
                    layers["Diğer Tarihi Yapılar (Han/Köprü/Müze)"].addLayer(marker);
                }

                return marker;
            }
        });

        // Veriler yüklendikten sonra tüm katmanları varsayılan olarak haritaya ekle
        for (var key in layers) {
            layers[key].addTo(map);
        }
    })
    .catch(error => console.error('GeoJSON yüklenirken hata oluştu:', error));

// Katman Kontrolü (Lejant)
var baseMaps = {
    "Sokak Haritası": osmLayer,
    "Uydu Görüntüsü": satelliteLayer
};

L.control.layers(baseMaps, layers, {collapsed: false}).addTo(map);