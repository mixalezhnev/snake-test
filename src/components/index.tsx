const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;

enum DIRECTIONS {
  RIGHT = "right",
  LEFT = "left",
  UP = "up",
  DOWN = "down",
}

class Figure {
  public width = 10;
  public height = 10;

  public x;
  public y;

  protected _color;
}

class Snake extends Figure {
  private _velocity = 10;

  private _direction;

  private _reachedConstraint = "";

  private _segments: Array<{ x: number, y: number }> = [
    {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
    }
  ];

  private _getHeadX() {
    return this._segments[0].x;
  }

  private _getHeadY() {
    return this._segments[0].y;
  }

  private _getTailX() {
    return this._segments[this._segments.length - 1].x;
  }

  private _setTailX(x) {
    this._segments[this._segments.length - 1].x = x;
  }

  private _getTailY() {
    return this._segments[this._segments.length - 1].y;
  }

  private _setTailY(y) {
    this._segments[this._segments.length - 1].y = y;
  }

  constructor(
    board: GlobalEventHandlers,
    private _food,
  ) {
    super();

    this._color = "black";

    this._direction = DIRECTIONS.RIGHT

    this._addListeners(board);

  }

  public draw(ctx: CanvasRenderingContext2D) {
    this._reachedConstraint = "";

    ctx.clearRect(
      this._getTailX(),
      this._getTailY(),
      this.width,
      this.height
    );

    ctx.fillStyle = this._color;

    this._handleConstraints();

    this._updateCoords();

    this._handleFoodCollision();

    this._reDraw(ctx);
  }

  private _reDraw(ctx) {
    this._segments.forEach((segment) => {
      ctx.fillRect(
        segment.x,
        segment.y,
        this.width,
        this.height,
      );
    });
  }

  private _updateCoords() {
    this._compareDirection(this._reachedConstraint, {
      right: () => {
        this._segments.unshift({ x: 0, y: this._getHeadY() });
        this._segments.pop();
      },
      left: () => {
        this._segments.unshift({ x: CANVAS_WIDTH - this.width, y: this._getHeadY() });
        this._segments.pop();
      },
      up: () => {
        this._segments.unshift({ x: this._getHeadX(), y: CANVAS_HEIGHT - this.height });
        this._segments.pop();
      },
      down: () => {
        this._segments.unshift({ x: this._getHeadX(), y: 0 });
        this._segments.pop();
      },
    });

    this._compareDirection(
      this._direction, {
        right: () => {
          this._segments.unshift({ x: (this._getHeadX() + this._velocity), y: this._getHeadY() });
          this._segments.pop();
        },
        left: () => {
          this._segments.unshift({ x: (this._getHeadX() - this._velocity), y: this._getHeadY() });
          this._segments.pop();
        },
        up: () => {
          this._segments.unshift({ y: (this._getHeadY() - this._velocity), x: this._getHeadX() });
          this._segments.pop();
        },
        down: () => {
          this._segments.unshift({ y: (this._getHeadY() + this._velocity), x: this._getHeadX() });
          this._segments.pop();
        },
      }
    );
  }

  private _compareDirection(
    comparable,
    {
      right,
      left,
      up,
      down,
    }
  ) {
    switch (comparable) {
      case DIRECTIONS.RIGHT:
        return right();
      case DIRECTIONS.LEFT:
        return left()
      case DIRECTIONS.UP:
        return up();
      case DIRECTIONS.DOWN:
        return down();
    }
  }

  // NOTE: possibly this class should not know anything without food, it should
  // determine does it collie anonymous entity end return the result outside,
  // but... it just a try
  private _handleFoodCollision() {
    const x = this._getHeadX();
    const y = this._getHeadY();

    if (
      x < this._food.x + this._food.width &&
      x + this.width > this._food.x &&
      y < this._food.y + this._food.height &&
      this.height + y > this._food.y
    ) {
      this._food.changePlace();
      this._addTail();
    }
  }

  private _addListeners(board: GlobalEventHandlers) {
    board.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.code === "ArrowUp" && this._direction !== DIRECTIONS.DOWN) {
        this._direction = DIRECTIONS.UP;
      } else if (e.code === "ArrowDown" && this._direction !== DIRECTIONS.UP) {
        this._direction = DIRECTIONS.DOWN;
      } else if (e.code === "ArrowLeft" && this._direction !== DIRECTIONS.RIGHT) {
        this._direction = DIRECTIONS.LEFT;
      } else if (e.code === "ArrowRight" && this._direction !== DIRECTIONS.LEFT) {
        this._direction = DIRECTIONS.RIGHT;
      }
    });
  }

  private _addTail() {
    const segment = this._compareDirection(
      this._direction,
      {
        right: () => ({
          x: this._getHeadX() + this.width,
          y: this._getHeadY(),
        }),
        left: () => ({
          x: this._getHeadX() - this.width,
          y: this._getHeadY(),
        }),
        up: () => ({
          x: this._getHeadX(),
          y: this._getHeadY() + this.height,
        }),
        down: () => ({
          x: this._getHeadX(),
          y: this._getHeadY() - this.height,
        }),
      },
    );

    this._segments.unshift(segment);
  }

  private _handleConstraints() {
    if (
      this._direction === DIRECTIONS.LEFT ||
      this._direction === DIRECTIONS.RIGHT
    ) {
      const x = this._getHeadX();

      const nextX = this._direction === DIRECTIONS.RIGHT
        ? x + this._velocity
        : x - this._velocity;

      if (nextX >= CANVAS_WIDTH) {
        this._reachedConstraint = DIRECTIONS.RIGHT;
      } else if (nextX < 0) {
        this._reachedConstraint = DIRECTIONS.LEFT;
      }
    } else if (
      this._direction === DIRECTIONS.UP ||
      this._direction === DIRECTIONS.DOWN
    ) {
      const y = this._getHeadY();

      const nextY = this._direction === DIRECTIONS.DOWN
        ? y + this._velocity
        : y - this._velocity;

      if (nextY >= CANVAS_HEIGHT) {
        this._reachedConstraint = DIRECTIONS.DOWN;
      } else if (nextY < 0) {
        this._reachedConstraint = DIRECTIONS.UP;
      }
    }
  }
}

class Page {
  public root;
  public canvas;
  public context;

  constructor() {
    this.root = document.getElementById("target");
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");

    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;

    this.root.appendChild(this.canvas);
  }

}

class Game {
  private _timer = 1000 / 10;

  constructor(
    private _page,
    private _updatables = [],
  ) {
    setTimeout(() => {
      if (this._timer !== 0) {
        this._timer -= 10;
      }
    }, 60000);

    this._update();
  }

  _update = () => {
    this._updatables.forEach(toUpdate => {
      toUpdate.draw(
        this._page.context
      );
    });

    setTimeout(this._update, this._timer);
  }
}

class Food extends Figure {
  private _isEated = false;

  constructor() {
    super();

    this._color = "red";

    this.changePlace();
  }

  public changePlace() {
    this._isEated = true;
  }

  private _recalcPosition() {
    const quads = CANVAS_WIDTH / this.width;
    this.x = Math.floor(Math.random() * quads - 1) * 10;
    this.y = Math.floor(Math.random() * quads - 1) * 10;
  }

  public draw(ctx) {
    ctx.clearRect(this.x, this.y, this.width, this.height);

    if (this._isEated) {
      this._recalcPosition();
    }

    ctx.fillStyle = this._color;

    ctx.fillRect(
      this.x,
      this.y,
      this.width,
      this.height,
    );

    this._isEated = false;
  }
}

const page = new Page();
const food = new Food();

new Game(
  page,
  [new Snake(document, food), food]
);
