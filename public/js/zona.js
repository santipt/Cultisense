// https://developer.mozilla.org/es/docs/Web/JavaScript/Referencia/template_strings

var botonZonaTemplate       = `<div class="btn-group btn-group-sm" role="group" style="margin: 5px;">
            <button class="btn btn-secondary" style="{bgcolor}" onclick="focusZona({id})">{Nombre de la zona}</button>
        </div>`;
var botonZonaSelectTemplate = `<div class="btn-group btn-group-sm" role="group" style="margin: 5px;">
            <button class="btn btn-light" style="{bgcolor}" onclick="focusZona({id})">{Nombre de la zona}</button>
        </div>`;

var zonaTemplate = `<p style="margin: 5px; background-color: white; color:black; text-align=center;"><i class="fas fa-leaf"></i> 
            Campo {id}
        </p>`;

var listaZonas = [];

let selectedZone = null;

function loadZonas() {

    $.ajax({
        url:      baseURI + 'user/zonas',
        dataType: "json",
        headers:  {
            'token': localStorage.getItem('token'),
        },
    }).done(function (r) {
        listaZonas = r;
        listaZonas.forEach(function (item) {
            item.vertices.forEach(function (vert) {
                vert.lat = parseFloat(vert.lat);
                vert.lng = parseFloat(vert.lng);
            });
            var zona = new google.maps.Polygon({
                paths:         item.vertices,
                strokeColor:   item.color,
                strokeOpacity: 0.8,
                strokeWeight:  3,
                fillColor:     item.color,
                fillOpacity:   0.35,
                editable:      false,
                visible:       false
            });
            zona.setMap(mapa);
            item.zona = zona;

            var str = botonZonaTemplate.replace('{Nombre de la zona}', item.name);
            str     = str.replace(/{id}/g, item.id);

            var c = "background-color: rgba(" + parseInt(item.color.substr(1, 2), 16) + "," +
                    parseInt(item.color.substr(3, 2), 16) + "," + parseInt(item.color.substr(5, 2), 16) + ",0.35)";
            str   = str.replace('{bgcolor}', c);

            item.control = $.parseHTML(str)[0];

            $('#zonas-list').append(item.control);


            str = botonZonaSelectTemplate.replace('{Nombre de la zona}', item.name);
            str = str.replace(/{id}/g, item.id);

            var c = "background-color: rgba(" + parseInt(item.color.substr(1, 2), 16) + "," +
                    parseInt(item.color.substr(3, 2), 16) + "," + parseInt(item.color.substr(5, 2), 16) + ",0.35)";
            str   = str.replace('{bgcolor}', c);

            item.control_select = $.parseHTML(str)[0];

            $('#zonas-preselect-list').append(item.control_select);

        });

        for (let i = 0; i < r.length; i++) {
            loadSensores(r[i].sensors);
            $("#mask").addClass("d-none");

        }
    });
}

function focusZona(id) {
    if (id !== null) {
        selectedZone = id;
    }

    $('#campoSelect').modal('hide');

    listaZonas.forEach(function (item) {
        var c = item.control.querySelector("i");
        var b = item.control.querySelector("button:nth-child(2)");

        if (item.id == id) {
            var bounds = new google.maps.LatLngBounds();
            item.zona.getPath().getArray().forEach(function (v) {
                bounds.extend(v);
            });
            mapa.fitBounds(bounds);
            item.zona.setVisible(true);

            refreshSensorList(id);
            var str4 = zonaTemplate.replace(/{id}/g, item.id);
            $('#zonaSelect').empty();
            $('#zonaSelect').append(str4);
            $('#eye-zone').removeClass('fa-eye-slash');
            $('#eye-zone').addClass('fa-eye');
        }
    });
    document.getElementById("dropdownMenu3").disabled = false;
}

function cargarZona(id) {
    console.log('cargaer:' + id);
    if (id === undefined) {
        id = selectedZone;
    }
    listaZonas.forEach(function (item) {
        var c = item.control.querySelector("i");
        var b = item.control.querySelector("button:nth-child(2)");
        if (item.id == id) {
            item.zona.setVisible(!item.zona.visible);
            if (item.zona.visible) {
                $('#eye-zone').removeClass('fa-eye');
                $('#eye-zone').addClass('fa-eye-slash');
            }
            else {
                $('#eye-zone').addClass('fa-eye-slash');
                $('#eye-zone').removeClass('fa-eye');
            }
        }
    });
}

loadZonas();


var zonaTemp;
