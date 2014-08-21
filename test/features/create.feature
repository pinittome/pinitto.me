Feature: Board creation

Background:

    Given I navigate to the create board page

Scenario: I see the create page
    
    Then I expect to see the create board page elements
    
Scenario: Not entering email address results in error

    When I click the 'Create board' button
    Then the 'owner' field has error 'Valid email address required'
