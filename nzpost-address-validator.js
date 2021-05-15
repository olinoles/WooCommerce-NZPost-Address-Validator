var inputField = document.querySelector("#billing_address_1");
var address_access_token = "";
inputField.setAttribute("autocomplete", "chrome-off");
inputField.addEventListener("keydown", (el) => { addressKeyPressHandler(el) });
fetch('YOUR AUTHENTICATION PAGE URL')
    .then(response => {
        response.json().then(json => {
            address_access_token = json.access_token;
        })
    });

var addressKeyPressHandler = debounce(function () {
    if (document.querySelector('#select2-billing_country-container')) {
        if (document.querySelector('#select2-billing_country-container').textContent != 'New Zealand') {
            document.querySelector('#suggestions-box').remove();
            return;
        }
    }
    if (inputField.value.length < 5) {
        document.querySelector('#suggestions-box').remove();
        return;
    }
    addressSuggestions = getAddressSuggestions(inputField.value);
}, 250);

//retrieve addresses from the NZ post API. Default to 10 addresses
function getAddressSuggestions(address) {
    fetch(('https://api.nzpost.co.nz/parceladdress/2.0/domestic/addresses?count=' + 10 + '&q=' + address),
        {
            headers: {
                Authorization: ('Bearer ' + address_access_token)
            }
        })
        .then(response => {
            response.json().then(json => {
                if (json.success) {
                    displayAddressSuggestions(json);
                    document.querySelectorAll('.address-suggestion').forEach(function (entry) {
                        entry.addEventListener("click", (el, ev) => { applyAddressSuggestion(el, entry.id) });
                    })
                }
            });
        });
}

function displayAddressSuggestions(addressSuggestions) {
    if (!document.querySelector('#suggestions-box')) {
        // create the suggestion container
        var suggestionsBox = document.createElement("UL");
        suggestionsBox.id = "suggestions-box";
        suggestionsBox.style = "z-index:99;position: absolute;list-style:none; background-color: white;padding: 10px;border: 1px solid lightgray;margin: 0;";
        document.querySelector("#billing_address_1_field").appendChild(suggestionsBox);
    }
    //remove any rows that could be inside the suggestion box
    document.querySelectorAll('.address-suggestion').forEach(function (entry) { entry.remove(); });
    document.querySelectorAll('.no-address-suggestion').forEach(function (entry) { entry.remove(); });
    //add suggestions, if any
    if (addressSuggestions.addresses.length > 0) {
        addressSuggestions.addresses.forEach(addAddressSuggestionRow);
    } else {
        addNoresultRow();
    }
    if (!document.querySelector('#nzpost-row')) { addNZPostRow(); }
}

function addAddressSuggestionRow(item, index) {
    var newAddressSuggestion = document.createElement("LI");
    newAddressSuggestion.textContent = item.full_address;
    newAddressSuggestion.className = "address-suggestion";
    newAddressSuggestion.id = item.address_id;
    newAddressSuggestion.style = "cursor:pointer;font-size:14px;padding:5px;";
    document.querySelector('#suggestions-box').appendChild(newAddressSuggestion);
    document.querySelector('#suggestions-box').insertBefore(newAddressSuggestion, document.querySelector('#suggestions-box').childNodes[0]);
}

function addNoresultRow() {
    var noResultRow = document.createElement("LI");
    noResultRow.textContent = "No suggestions were found.";
    noResultRow.className = "no-address-suggestion";
    noResultRow.style = "font-size:14px;padding:5px;";
    document.querySelector('#suggestions-box').appendChild(noResultRow);
    document.querySelector('#suggestions-box').insertBefore(noResultRow, document.querySelector('#suggestions-box').childNodes[0]);
}

function addNZPostRow() {
    document.querySelector('#suggestions-box').innerHTML += '<li id="nzpost-row" style="display: block; opacity: 1; background: rgb(255, 255, 255); padding: 5px;"><div style="background: url(&quot;https://address.nzpost.co.nz/assets/brought-to-you-by-nzpost.png&quot;) right center no-repeat; white-space: nowrap; display: block; padding: 0px; border-style: none; height: 24px;"></div></li>';
}

function applyAddressSuggestion(element, address) {
    //delete the suggestions box dom
    document.querySelector('#suggestions-box').remove();

    fetch(('https://api.nzpost.co.nz/parceladdress/2.0/domestic/addresses/' + address),
        {
            headers: {
                Authorization: ('Bearer ' + address_access_token)
            }
        })
        .then(response => {
            response.json().then(json => {
                if (json.success) {
                    document.querySelector("#billing_postcode").value = json.address.postcode;
                    document.querySelector("#billing_city").value = formattedCity(json.address);
                    document.querySelector("#billing_address_2").value = json.address.suburb;
                    document.querySelector("#billing_address_1").value = formattedStreetAddress(json.address);

                    if (!document.querySelector('#ship-to-different-address-checkbox').checked) {
                        document.querySelector("#shipping_postcode").value = json.address.postcode;
                        document.querySelector("#shipping_city").value = formattedCity(json.address);
                        document.querySelector("#shipping_address_2").value = json.address.suburb;
                        document.querySelector("#shipping_address_1").value = formattedStreetAddress(json.address);
                    }
                }
            });
        });
}

//this function stops the request if more input is detected, to prevent flooding the API
function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

function formattedCity(address) {
    var ruralDeliveryString = "";

    if (address.rural_delivery_number) {
        ruralDeliveryString = address.rural_delivery_number;
    }

    return address.city + " " + ruralDeliveryString;
}

function formattedStreetAddress(address) {
    console.log(address);
    var streetAddress = "";
    var unitString = "";
    var floorString = "";
    var streetNumberString = "";
    var streetNameString = "";
    var ruralDeliveryString = "";

    if (address.unit_type) {
        unitString += address.unit_type + " ";
    }
    if (address.unit_value) {
        unitString += address.unit_value + ", ";
    }

    if (address.street_number) {
        streetNumberString += address.street_number;
        if (address.street_alpha) {
            streetNumberString += address.street_alpha + " ";
        } else {
            streetNumberString += " ";
        }
    }

    if (address.floor) {
        floorString = address.floor + ", ";
    }

    if (address.street) {
        streetNameString += address.street + " ";
    }
    if (address.street_type) {
        streetNameString += address.street_type;
    }

    return unitString + floorString + streetNumberString + streetNameString
}