@google-map
Feature: Google Maps Demo
As a User, I want to interact with Google Maps so that I can explore locations and get directions.

  Background:
    Given I navigate to Google maps

  Scenario Outline: Search for a location on Google Maps
    When I enter '<source>' as source
    Then I should see '<location>' on the side panel

    Examples:
      | source      | location      |
      | San Jose CA | San Jose      |
      | Chico CA    | Chico         |

  Scenario: Get directions from one location to another
    When I enter 'Sacramento CA' as source
    Then I should see 'Sacramento' on the side panel
    And I click the 'Directions' button
    And I enter "San Francisco CA" as destination
    Then I should see the url includes "38.1779576,-122.6789672" coordinates
    And I should see following source and destination locations in the side panelbar:
      | San Francisco |
      | Sacramento    |
    Then I save all routes to a text file "directions.txt"