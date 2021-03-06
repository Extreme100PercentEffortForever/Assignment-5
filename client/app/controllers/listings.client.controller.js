angular.module('listings').controller('ListingsController', ['$scope', '$location', '$stateParams', '$state', 'Listings',
  function($scope, $location, $stateParams, $state, Listings){
    $scope.find = function() {
      /* set loader*/
      $scope.loading = true;

      /* Get all the listings, then bind it to the scope */
      Listings.getAll().then(function(response) {
        $scope.loading = false; //remove loader
        $scope.listings = response.data;
      }, function(error) {
        $scope.loading = false;
        $scope.error = 'Unable to retrieve listings!\n' + error;
      });
    };
	
    $scope.findOne = function() {
      debugger;
      $scope.loading = true;

      /*
        Take a look at 'list-listings.client.view', and find the ui-sref attribute that switches the state to the view
        for a single listing. Take note of how the state is switched:

          ui-sref="listings.view({ listingId: listing._id })"

        Passing in a parameter to the state allows us to access specific properties in the controller.

        Now take a look at 'view-listing.client.view'. The view is initialized by calling "findOne()".
        $stateParams holds all the parameters passed to the state, so we are able to access the id for the
        specific listing we want to find in order to display it to the user.
       */

      var id = $stateParams.listingId;

      Listings.read(id)
              .then(function(response) {
                $scope.listing = response.data;
                $scope.loading = false;
              }, function(error) {
                $scope.error = 'Unable to retrieve listing with id "' + id + '"\n' + error;
                $scope.loading = false;
              });
    };

    $scope.create = function(isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      /* Create the listing object */
      var listing = {
        name: $scope.name,
        code: $scope.code,
        address: $scope.address
      };

      /* Save the article using the Listings factory */
      Listings.create(listing)
              .then(function(response) {
                //if the object is successfully saved redirect back to the list page
                $state.go('listings.list', { successMessage: 'Listing succesfully created!' });
              }, function(error) {
                //otherwise display the error
                $scope.error = 'Unable to save listing!\n' + error;
              });
    };

    $scope.update = function(isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }
	  
	  Listings.update($stateParams.listingId, $scope.listing)
      .then(function(response) {
        //if the object is successfully saved redirect back to the list page
        $state.go('listings.list', { successMessage: 'Listing succesfully updated!' });
      }, function(error) {
        //otherwise display the error
        $scope.error = 'Unable to save listing!\n' + error;
      });
    };

    $scope.remove = function() {

      $scope.error = null;
      var target = $stateParams.listingId;
      Listings.delete(target)
      .then(function(response) {
        //if the object is successfully saved redirect back to the list page
        $state.go('listings.list', { successMessage: 'Listing succesfully removed!' });
      }, function(error) {
        //otherwise display the error
        $scope.error = 'Unable to remove listing!\n' + error;
      });
      //
      /*
        Implement the remove function. If the removal is successful, navigate back to 'listing.list'. Otherwise,
        display the error.
       */
    };

    /* Bind the success message to the scope if it exists as part of the current state */
    if($stateParams.successMessage) {
      $scope.success = $stateParams.successMessage;
    }

    /* Map properties */
    $scope.map = {
      center: {
        latitude: 29.65163059999999,
        longitude: -82.3410518
      },
      zoom: 14,
	  bounds: {}
    }
    //////////////////////////
	
    $scope.options = {
      scrollwheel: true
    };
    var createMarker = function(i, bounds, idKey) {
		
      if (idKey == null) {
        idKey = "id";
      }

      var ret = {
        latitude: $scope.listings[i].coordinates.latitude,
        longitude: $scope.listings[i].coordinates.longitude,
        code: $scope.listings[i].code,
		address: $scope.listings[i].address,
		name: $scope.listings[i].name,
		show: false
      };
	  
      ret[idKey] = i;

      return ret;
    };
	
	$scope.onClick = function(marker, eventName, model) {
        console.log("Clicked!");
        model.show = !model.show;
    };
	
    $scope.markers = [];
    // Get the bounds from the map once it's loaded
    $scope.$watch(function() {
      return $scope.map.bounds;
    }, function(nv, ov) {
      // Only need to regenerate once
      if (!ov.southwest && nv.southwest) {
        var markersArr = [];
		var listss = $scope.listings[1];
        for (var i = 0; i < $scope.listings.length; i++) {
			
			listss = $scope.listings[i];
			if ('undefined' !== typeof(listss.coordinates)) {
				markersArr.push(createMarker(i, $scope.map.bounds))
			}
        }
        $scope.markers = markersArr;
      }
    }, true);

  }
]);

/////////////////
