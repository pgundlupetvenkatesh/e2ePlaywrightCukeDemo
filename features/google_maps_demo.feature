@google-map
Feature: Google Maps Demo
As a User, I want to interact with Google Maps so that I can explore locations and get directions.

  Background:
    Given I navigate to Google maps
  @a
  Scenario Outline: Search for a location on Google Maps
    When I enter '<source>' as source
    Then I should see '<location>' on the side panel

    Examples:
      | source      | location      |
      | San Jose CA | San Jose      |
      | Chico CA    | Chico         |
  @b
  Scenario: Get directions from one location to another
    When I enter 'Sacramento CA' as source
    Then I should see 'Sacramento' on the side panel
    And I click the 'Directions' button
    And I enter "San Francisco CA" as destination
    Then I should see the url includes "38.1812012,-122.6163293" coordinates
    And I click the 'Driving' radio button
    And I should see following source and destination locations in the searchbars:
      | San Francisco, California |
      | Sacramento, California    |
    Then I save all routes to a text file "directions.txt"