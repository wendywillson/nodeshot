/* --- gobal utility functions --- */
// implement String trim for older browsers
if (!String.prototype.trim) {
    String.prototype.trim = $.trim;
}

// extend jquery to be able to retrieve a cookie
$.getCookie = function (name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');

        for (var i = 0; i < cookies.length; i++) {
            var cookie = $.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

$.csrfSafeMethod = function (method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

$.sameOrigin = function (url) {
    // test that a given url is a same-origin URL
    // url could be relative or scheme relative or absolute
    var host = document.location.host; // host + port
    var protocol = document.location.protocol;
    var sr_origin = '//' + host;
    var origin = protocol + sr_origin;
    // Allow absolute or scheme relative URLs to same origin
    return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
        (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
    // or any other URL that isn't scheme relative or absolute i.e relative.
    !(/^(\/\/|http:|https:).*/.test(url));
}

$.ajaxSetup({
    beforeSend: function (xhr, settings) {
        if (!$.csrfSafeMethod(settings.type) && $.sameOrigin(settings.url)) {
            // Send the token to same-origin, relative URLs only.
            // Send the token only if the method warrants CSRF protection
            // Using the CSRFToken value acquired earlier
            xhr.setRequestHeader("X-CSRFToken", $.getCookie('csrftoken'));
        }
    }
});

// Converts from degrees to radians.
Math.radians = function (degrees) {
    return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function (radians) {
    return radians * 180 / Math.PI;
};

/*
 * Get Data with async false
 * Returns response from server without having to use a callback
 */
$.getData = function (url) {
    var data;

    $.ajax({
        async: false, //thats the trick
        url: url,
        dataType: 'json',
        success: function (response) {
            data = response;
        },
        error: function (e) {
            alert(e)
        }
    });

    return data;
}

/*
 * Load nodes in cluster group and defines click properties for the popup window
 */
function loadNodes(newClusterNodes, color) {

    var layer = L.geoJson(newClusterNodes, {

        onEachFeature: function (feature, layer) {
            layer.on('click', function (e) {
                this.bindPopup(feature.properties.name);
            });

        },
        pointToLayer: function (feature, latlng) {
            var marker = new L.circleMarker(latlng, {
                radius: 6,
                fillColor: color,
                color: color,
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });

            return marker;
        }

    });

    return layer;
}

/*
 * Creates cluster group
 */
function createCluster(clusterClass) {
    var newCluster = new L.MarkerClusterGroup({
        iconCreateFunction: function (cluster) {
            return L.divIcon({
                html: cluster.getChildCount(),
                className: clusterClass,
                iconSize: L.point(30, 30)
            });
        },
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: true,
        zoomToBoundsOnClick: true
    });
    return newCluster;
}