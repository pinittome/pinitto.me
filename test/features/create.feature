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

Scenario: Entering an email address gets me to a new board

    Given I enter 'user@example.com' in the 'owner' field
    When I click the 'Create board' button
    Then I am redirected to a new board
    
Scenario: Can add a title to a new board

    Given I enter 'user@example.com' in the 'owner' field
    And I enter 'My new board' in the 'board-name' field
    When I click the 'Create board' button
    Then I am redirected to a new board
    And the new board has the expected title
    
Scenario: Can create a board with a URL identifier

    Given I enter 'user@example.com' in the 'owner' field
    And I enter 'my-new-board' in the 'slug' field
    When I click the 'Create board' button
    Then I am redirected to the identified board