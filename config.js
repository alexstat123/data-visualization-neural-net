settings = {
    tabSize: 30,
    barHeight: 20,
    rootWidth: 200,
    gapSize: 3,
    showLegend: true,
    showIds: true
}

function loadSettingsFile(event) {
    var reader = new FileReader();
    reader.onload = function (e) {
        const loaded = JSON.parse(e.target.result);

        Object.keys(settings).forEach(key => {
            if (loaded[key]) {
                settings[key] = loaded[key];
            }
        });

        $("#slider_LayerWidth").val(settings.rootWidth);
        $("#slider_LayerHeight").val(settings.barHeight);
        $("#slider_horizontalGap").val(settings.gapSize);

        $(window).trigger("changedSettings");


    };
    reader.readAsText(event.target.files[0]);
}

function saveSettingsToFile() {
    const toDownload = JSON.stringify(settings);

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(toDownload);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "settings.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}


$(window).on("load", function () {
    $("#btn_saveSettings").on("click", saveSettingsToFile);
    $("#btn_loadSettings").on("change", loadSettingsFile);

    $("#slider_LayerWidth").on("input change", function (e) {
        settings.rootWidth = parseInt($(this).val());
    });

    $("#slider_LayerHeight").on("input change", function (e) {
        settings.barHeight = parseInt($(this).val());
    });

    $("#slider_horizontalGap").on("input change", function (e) {
        settings.gapSize = parseInt($(this).val());
    });

    $("#check_showLegend").on("change", function (e) {
        $("#container_Legend").toggleClass("d-none", !this.checked);
        $("#container_neuralNetwork").toggleClass("col-xl-12", !this.checked);
        settings.showLegend = this.checked;
    });

    $("#check_showIds").on("change", function (e) {
        settings.showIds = this.checked;
    });


    $("#container_LeftSidebar").on("input change", function (e) {
        $(window).trigger("changedSettings");
        //  $(window).trigger("graphLoaded", graph);

    });

});

$(window).on("changedSettings", function () {
    $(window).trigger("graphLoaded", graph);
});
