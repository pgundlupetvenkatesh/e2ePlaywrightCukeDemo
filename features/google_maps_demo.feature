@google-map
Feature: Google Maps Demo
As a User, I want to interact with Google Maps so that I can explore locations and get directions.

  Scenario: Search for a location on Google Maps
    Given I navigate to Google maps
    When I enter 'Sacramento CA' as source
    Then I should see 'Sacramento' on the side panel

  Scenario: Get directions from one location to another
    And I click the 'Directions' button
    And I enter "San Francisco CA" as destination
    Then I should see the url includes "38.5619118,-121.6265496" coordinates
    Then I save the all routes to a text file "directions.txt"
