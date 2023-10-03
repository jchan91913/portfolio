<?php

// Enter the path that the oauth library is in relation to the php file
require_once('lib/OAuth.php');
include('template.html');

// Set your OAuth credentials here  
// These credentials can be obtained from the 'Manage API Access' page in the
// developers documentation (http://www.yelp.com/developers)
$CONSUMER_KEY = "4V68PoYkgAk5Z4c01Kin_Q";
$CONSUMER_SECRET = "5UFYLtuuj8rqiwyfiQ6EaDeDItI";
$TOKEN = "ZAotJ7tkvSRKtoRR8nneiqET16GE5nHN";
$TOKEN_SECRET = "AgAZma_FAQilSaixehheGoqw8yE";

$API_HOST = 'api.yelp.com';
$SEARCH_PATH = '/v2/search/';

function request($host, $path) {
    $unsigned_url = "https://" . $host . $path;

    // Token object built using the OAuth library
    $token = new OAuthToken($GLOBALS['TOKEN'], $GLOBALS['TOKEN_SECRET']);

    // Consumer object built using the OAuth library
    $consumer = new OAuthConsumer($GLOBALS['CONSUMER_KEY'], $GLOBALS['CONSUMER_SECRET']);

    // Yelp uses HMAC SHA1 encoding
    $signature_method = new OAuthSignatureMethod_HMAC_SHA1();

    $oauthrequest = OAuthRequest::from_consumer_and_token(
        $consumer, 
        $token, 
        'GET', 
        $unsigned_url
    );
    
    // Sign the request
    $oauthrequest->sign_request($signature_method, $consumer, $token);
    
    // Get the signed URL
    $signed_url = $oauthrequest->to_url();
    
    // Send Yelp API Call
    try {
        $ch = curl_init($signed_url);
        if (FALSE === $ch)
            throw new Exception('Failed to initialize');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        $data = curl_exec($ch);

        if (FALSE === $data)
            throw new Exception(curl_error($ch), curl_errno($ch));
        $http_status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if (200 != $http_status)
            throw new Exception($data, $http_status);

        curl_close($ch);
    } catch(Exception $e) {
        trigger_error(sprintf(
            'Curl failed with error #%d: %s',
            $e->getCode(), $e->getMessage()),
            E_USER_ERROR);
    }
    
    return $data;
}

/**
 * Query the Search API by a category and location 
 * 
 * @param    $category    The search category passed to the API 
 * @param    $location    The search location passed to the API 
 * @return   The JSON response from the request 
 */
function search($category, $location) {
    $url_params = array();
    
    $url_params['category_filter'] = $category;
    $url_params['location'] = $location;
    $url_params['limit'] = 20; // The number of businesses it will find
    $search_path = $GLOBALS['SEARCH_PATH'] . "?" . http_build_query($url_params);
    
    return request($GLOBALS['API_HOST'], $search_path);
}

/**
 * Queries the API by the input values from the user 
 * 
 * @param    $category    The category to query
 * @param    $location    The location of the business to query
 */
function query_api($category, $location) {     
    // Returns an associative array
    $response = json_decode(search($category, $location), true);
    return $response;
}

function grab_businesses($assoArray) {
	$businesses = $assoArray['businesses'];
	return $businesses;
}

// Index 0 is the first one
function grab_business($assoArray, $index) {
	$business = $assoArray[$index];
	return $business;
}

// Displays the specific information about the business
function display_info($business) {
    $name = $business['name'];
    $yelpURL = $business['url'];
    $imgURL = $business['image_url'];
    $ratingURL = $business['rating_img_url_large'];

    echo "<h3><a href=\"$yelpURL\">$name</a></h3>";
    foreach ($business['categories'] as $key => $value) {
        echo "<span class=\"tag tag-primary\">$value[0]</span> ";
    }
    echo "<br><br>";
    echo "<img alt=\"rating\" src=\"$ratingURL\"><br>";
    echo "<img alt=\"$name\" height=\"150\" src=\"$imgURL\" width=\"150\"><br><br>";
    echo "<button id=\"viewInfo\" type=\"button\" class=\"btn btn-outline-primary\" onclick=\"displayMore()\">Show More Info</button><br><br>";
    echo "<div class=\"additionalInfo alert alert-success\" role=\"alert\" style=\"display: none;\">";
    if (isset($business['location']['neighborhoods'][0] )) {
        $neighborhood = $business['location']['neighborhoods'][0];
        echo "<strong>$neighborhood</strong><br><br>";
    }
    echo "<strong>Address</strong><br>";
    foreach($business['location']['display_address'] as $key => $value) {
        echo "$value<br>";
    }
    if (isset($business['phone'])) {
        $phone = $business['phone'];
        $phoneFormat = "(" . substr($phone, 0, 3) . ") " .substr($phone, 3, 3) . "-" . substr($phone,6);
        echo "<br><strong>Phone: </strong>$phoneFormat";
    }
    echo "<br><br><strong>more details on  </strong><a href=\"$yelpURL\"><img alt=\"yelp\" height=\"100\" src=\"https://s3-media2.fl.yelpcdn.com/assets/srv0/developer_pages/ebeb7fcf7307/assets/img/yelp-2c-outline.png\" width=\"100\"></a>";
    echo "</div>";
    echo "<hr>";
    echo "<br>";
}
// end functions

echo "<nav class=\"navbar navbar-dark bg-primary navbar-fixed-top\">
            <a class=\"navbar-brand\" href=\"yelpAPI.php\"><span class=\"typcn typcn-arrow-shuffle\"></span>imBored.</a>
            <ul class=\"nav navbar-nav\">
                 <li class=\"nav-item active\">
                    <a class=\"nav-link\" href=\"yelpAPI.php\">Home <span class=\"sr-only\">(current)</span></a>
                </li>
                 <li class=\"nav-item\">
                    <a class=\"nav-link\" href=\"about.php\">About</a>
                </li>
            </ul>
        </nav><br>";

if (isset($_POST['submit'])) {
    if (isset($_POST['category']) && isset($_POST['location'])) {
        $category = $_POST['category'];
        $location = $_POST['location'];
        $randomIndex = mt_rand(0, 19); // Random between 0-9 (inclusive)
        $assoArray  = query_api($category, $location);
        $businesses = grab_businesses($assoArray);
        $business = grab_business($businesses, $randomIndex);
        display_info($business);
    }
}

?>

	<body>
    <div class="alert alert-info">
            <strong>Get Started!</strong>  Find out what to do by choosing a category and location.
      </div>
        <form class="form-horizontal" action="" role= "form" method="POST">
            <div class="form-group">
                <label for="category"><strong>Category</strong></label>
                <select class ="form-control" name="category" id="category">
                    <option value="food" <?php 
                                            if (isset($_POST['category'])) {
                                                if ($_POST['category'] == "food") {
                                                    echo 'selected="selected" '; 
                                                }
                                            }
                                            ?>>Food</option>

                    <option value="coffee" <?php 
                                                if (isset($_POST['category'])) {
                                                    if ($_POST['category'] == "coffee") {
                                                        echo 'selected="selected" '; 
                                                    }
                                                }
                                            ?>>Coffee</option>

                    <option value="active" <?php
                                                if (isset($_POST['category'])) {
                                                    if ($_POST['category'] == "active"){
                                                        echo 'selected="selected" ';
                                                    }
                                                }
                                            ?>>Active Activities</option>

                    <option value="arts" <?php
                                                if (isset($_POST['category'])) {
                                                    if ($_POST['category'] == "arts"){
                                                        echo 'selected="selected" ';
                                                    }
                                                }
                                            ?>>Arts &amp; Entertainment</option>

                    <option value="nightlife" <?php
                                                if (isset($_POST['category'])) {
                                                    if ($_POST['category'] == "nightlife"){
                                                        echo 'selected="selected" ';
                                                    }
                                                }
                                            ?>>Nightlife</option>
                </select><br>
                <label for="location"><strong>Location</strong></label>
                <select class = "form-control" name="location" id="location">
                    <option value="Vancouver, BC" <?php
                                                if (isset($_POST['location'])) {
                                                    if ($_POST['location'] == "Vancouver, BC") {
                                                        echo 'selected="selected" ';
                                                    }
                                                }
                                                ?>>Vancouver</option>

                    <option value="Richmond, BC" <?php
                                                if (isset($_POST['location'])) {
                                                    if ($_POST['location'] == "Richmond, BC"){
                                                        echo 'selected="selected" ';
                                                    }
                                                }
                                                ?>>Richmond</option>

                    <option value="Burnaby, BC" <?php
                                                if (isset($_POST['location'])) {
                                                    if ($_POST['location'] == "Burnaby, BC") {
                                                        echo 'selected="selected" ';
                                                    }
                                                }
                                                ?>>Burnaby</option>

                    <option value="Surrey, BC" <?php
                                                if (isset($_POST['location'])) {
                                                    if ($_POST['location'] == "Surrey, BC") {
                                                        echo 'selected="selected" ';
                                                    }
                                                }
                                                ?>>Surrey</option>

                    <option value="Abbotsford, BC" <?php
                                                if (isset($_POST['location'])) {
                                                    if ($_POST['location'] == "Abbotsford, BC") {
                                                        echo 'selected="selected" ';
                                                    }
                                                }
                                                ?>>Abbotsford</option>

                    <option value="Victoria, BC" <?php
                                                if (isset($_POST['location'])) {
                                                    if ($_POST['location'] == "Victoria, BC") {
                                                        echo 'selected="selected" ';
                                                    }
                                                }
                                                ?>>Victoria</option>

                     <option value="Kelowna, BC" <?php
                                                if (isset($_POST['location'])) {
                                                    if ($_POST['location'] == "Kelowna, BC") {
                                                        echo 'selected="selected" ';
                                                    }
                                                }
                                                ?>>Kelowna</option>

                    <option value="Coquitlam, BC" <?php
                                                if (isset($_POST['location'])) {
                                                    if ($_POST['location'] == "Coquitlam, BC") {
                                                        echo 'selected="selected" ';
                                                    }
                                                }
                                                ?>>Coquitlam</option>

                    <option value="Langley, BC" <?php
                                                if (isset($_POST['location'])) {
                                                    if ($_POST['location'] == "Langley, BC") {
                                                        echo 'selected="selected" ';
                                                    }
                                                }
                                                ?>>Langley</option>
                </select><br><br>
                </select><br><br>
             </div>
            <input type="submit" name="submit" value="<?php
                                                        if (isset($_POST['submit'])){
                                                            echo "Anotha One";
                                                        }
                                                        else{
                                                            echo "Generate";
                                                        }
                                                        ?>" class = "btn btn-primary"/>
                                                        
        </form>
        <footer class="navbar-fixed-bottom bg-primary">
            <span class="copyright">Copyright ©2016 imBored, All Rights Reserved</span>
            <a class="footerAnchor" href="http://twitter.com/cachemon3y"><span class="typcn typcn-social-twitter"></span></a>
            <a class="footerAnchor" href="http://instagram.com/jshuachan"><span class="typcn typcn-social-instagram"></span></a>
            <a class="footerAnchor" href="http://facebook.com"><span class="typcn typcn-social-facebook"></span></a>
        </footer>
	</body>
</html>