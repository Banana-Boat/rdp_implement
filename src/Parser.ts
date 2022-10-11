import Tokenizer from "./Tokenizer";
import {
  Token,
  TokenType,
  ASTNodeType,
  ASTRoot,
  ASTExpressionNode,
  ASTNode,
} from "./types";

class Parser {
  _string: string;
  _tokenizer: Tokenizer;
  _lookahead: Token | null;

  constructor() {
    this._string = "";
    this._tokenizer = new Tokenizer();
    this._lookahead = null;
  }

  parse(string: string) {
    this._string = string;
    this._tokenizer.init(string);
    this._lookahead = this._tokenizer.getNextToken();

    return this.Program();
  }

  Program(): ASTRoot {
    return {
      type: ASTNodeType.Program,
      body: this.StatementList(),
    };
  }

  StatementList(): ASTExpressionNode[] {
    const statementList = [this.Statement()];
    while (this._lookahead !== null) {
      statementList.push(this.Statement());
    }
    return statementList;
  }

  Statement(): ASTExpressionNode {
    return this.ExpressionStatement();
  }

  ExpressionStatement(): ASTExpressionNode {
    const expression = this.Expression();
    this._eat(TokenType.Semicolon);
    return {
      type: ASTNodeType.ExpressionStatement,
      expression,
    };
  }

  Expression(): ASTNode {
    return this.Literal();
  }

  Literal(): ASTNode {
    switch (this._lookahead?.type) {
      case TokenType.Number:
        return this.NumericLiteral();
      case TokenType.String:
        return this.StringLiteral();
      default:
        throw new SyntaxError("Literal: unexpected literal production");
    }
  }

  NumericLiteral(): ASTNode {
    const token = this._eat(TokenType.Number);
    return {
      type: ASTNodeType.NumericLiteral,
      value: Number(token.value),
    };
  }

  StringLiteral(): ASTNode {
    const token = this._eat(TokenType.String);
    return {
      type: ASTNodeType.StringLiteral,
      value: (token.value as string).slice(1, -1),
    };
  }

  _eat(tokenType: TokenType) {
    const token = this._lookahead;

    if (!token)
      throw new SyntaxError(`Unexpected end of input, expected: ${tokenType}`);

    if (tokenType !== token.type)
      throw new SyntaxError(
        `Unexpected token: ${token.value}, expected: ${tokenType}`
      );

    this._lookahead = this._tokenizer.getNextToken();
    return token;
  }
}

export default Parser;
