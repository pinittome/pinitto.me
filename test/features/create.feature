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
    And the board has the expected title
    
Scenario: Errors if I add a board identifier which is too short

    Given I enter 'user@example.com' in the 'owner' field
    And I enter 'my' in the 'slug' field
    When I click the 'Create board' button
    Then the 'slug' field has error 'Must be 3 - 256 characters in length'
    
Scenario: Can create a board with a URL identifier

    Given I enter 'user@example.com' in the 'owner' field
    And I enter 'my-new-board' in the 'slug' field
    When I click the 'Create board' button
    Then I am redirected to the identified board
    
Scenario: Switches out bad characters in the board identifier

    Given I enter 'user@example.com' in the 'owner' field
    And I enter 'my $NeW &board!' in the 'slug' field
    When I click the 'Create board' button
    Then I am redirected to the identified board

Scenario: Errors if the board identifier already exists
 
    Given I create a board with identifier 'hello'
    And I navigate to the create board page
    And I enter 'user@example.com' in the 'owner' field
    And I enter 'hello' in the 'slug' field
    When I click the 'Create board' button
    Then the 'slug' field has error 'Board with provided URL identifier already exists'