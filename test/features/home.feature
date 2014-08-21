Feature: Home page

Scenario: I see the home page
    
    Given I navigate to the home page
    Then I expect to see the home page elements
    
Scenario: I can navigate to create board

    Given I navigate to the home page
    When I click the 'Create New Board' button
    Then I am sent to the create board page