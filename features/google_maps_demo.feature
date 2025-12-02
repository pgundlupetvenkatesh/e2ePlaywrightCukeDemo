@google-map
Feature: Google Maps Demo
As a User, I want to interact with Google Maps so that I can explore locations and get directions.

  Background:
    Given I navigate to Google maps

  Scenario: Search for a location on Google Maps
    When I enter 'Chico CA' as source
    Then I should see 'Chico' on the side panel

  Scenario: Get directions from one location to another
    When I enter 'Sacramento CA' as source
    Then I should see 'Sacramento' on the side panel
    And I click the 'Directions' button
    And I enter "San Francisco CA" as destination
    Then I should see the url includes "38.5619118,-121.6265496" coordinates
    Then I save all routes to a text file "directions.txt"
