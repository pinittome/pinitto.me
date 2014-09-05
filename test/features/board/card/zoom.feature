Feature: Card zoom

Background:

    Given a created board    

Scenario: When I click zoom I see a zoomed card

    When I create a card
    And I click zoom
    Then I see a zoomed card

Scenario: Should allow zooming out

    When I create a card
    And I click zoom
    And I click to zoom out
    Then I see a reset view