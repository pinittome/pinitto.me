Feature: Card link

Background:

    Given a created board    
    When I create a card
    
Scenario: When I the link button I see a link modal

    When I click for card link
    Then I see the link modal
    And the expected link modal elements
