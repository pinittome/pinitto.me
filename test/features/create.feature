Feature: Board creation

Background:

    Given I navigate to the create board page

Scenario: I see the create page
    
    Then I expect to see the create board page elements
    
Scenario: Not entering email address results in error

    When I click the 'Create board' button
    Then the 'owner' field has error 'Valid email address required'
    
Scenario: Entering an invalid email address results in error

    Given I enter 'not-an-email-address' in the 'owner' field
    When I click the 'Create board' button
    Then the 'owner' field has error 'Valid email address required'

Scenario: Entering an email address gets me to a board

    Given I enter 'user@example.com' in the 'owner' field
    When I click the 'Create board' button
    Then I am redirected to a new board