<h2>Description:</h2>  

A simple JS script I wrote for adding address validation to the WooCommerce checkout.  When a user begins typing their address into the address field, the script will create a populated list of results. When an address is clicked on, it will fill all address fields.
It uses the NZ Post parcel address API to validate user input on the address field at the WooCommerce checkout. You will need to obtain permission from NZ post to use their API first. [NZ Post API reference here](https://anypoint.mulesoft.com/exchange/portals/nz-post-group/b8271f09-2ad8-4e1c-b6b1-322c5727d148/parceladdress-api/)

You can also use [this PHP script](https://github.com/olinoles/Retrieve-NZ-Post-API-Token) to generate your API token.
<h2>Compatibility:</h2>  

Tested up to WooCommerce version 4.8.0.   
Compatible with desktop and mobile layouts

<h2>Use:</h2>  

Replace the placeholder text in Line 5 with your authentication page URL.  
Upload the JS script to a folder in your child theme, then add the below code in functions.php.
```
 function hook_address_validator() {
  if (is_checkout()) { 
    wp_enqueue_script( 'address-validator', get_stylesheet_directory_uri() . '/js/nzpost-address-validator.js', array(), '1.2.0', true );
  }
}
add_action('wp_head', 'hook_address_validator');
```

<h2>Issues:</h2>  

If you find any bugs, please let me know. If you want to contribute, feel free to send a pull request.

<h2>Image:</h2> 

![Demo](https://github.com/olinoles/Wordpress-NZPost-Address-validator/blob/master/demo.jpg)
