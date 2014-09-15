Feature: Card zoom

Background:

    Given a created board    
    When I create a card
    
Scenario: When I click zoom I see a zoomed card

    Given I click zoom
    Then I see a zoomed card

Scenario: Should allow zooming out

    Given I click zoom
    And I see the zoom out link
    When I click to zoom out
    Then I see a reset view