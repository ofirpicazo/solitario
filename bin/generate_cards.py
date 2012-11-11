#!/usr/bin/python
# coding: utf-8

import argparse
import sys

SUIT_MAP = {
  'club': '♣',
  'diamond': '♦',
  'heart': '♥',
  'spade': '♠',
}

templateA = """
<div class="card %(suit)s" id="%(id)s" data-suit="%(suit)s" data-number="%(number)s">
  <div class="flipper">
    <div class="front">
      <div class="corner top">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
      <span class="suit middle center">%(symbol)s</span>
      <div class="corner bottom">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
    </div>
    <div class="back"></div>
  </div>
</div>"""

template2 = """
<div class="card %(suit)s" id="%(id)s" data-suit="%(suit)s" data-number="%(number)s">
  <div class="flipper">
    <div class="front">
      <div class="corner top">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
      <span class="suit top center">%(symbol)s</span>
      <span class="suit bottom center">%(symbol)s</span>
      <div class="corner bottom">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
    </div>
    <div class="back"></div>
  </div>
</div>"""

template3 = """
<div class="card %(suit)s" id="%(id)s" data-suit="%(suit)s" data-number="%(number)s">
  <div class="flipper">
    <div class="front">
      <div class="corner top">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
      <span class="suit top center">%(symbol)s</span>
      <span class="suit middle center">%(symbol)s</span>
      <span class="suit bottom center">%(symbol)s</span>
      <div class="corner bottom">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
    </div>
    <div class="back"></div>
  </div>
</div>"""

template4 = """
<div class="card %(suit)s" id="%(id)s" data-suit="%(suit)s" data-number="%(number)s">
  <div class="flipper">
    <div class="front">
      <div class="corner top">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
      <span class="suit top left">%(symbol)s</span>
      <span class="suit top right">%(symbol)s</span>
      <span class="suit bottom left">%(symbol)s</span>
      <span class="suit bottom right">%(symbol)s</span>
      <div class="corner bottom">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
    </div>
    <div class="back"></div>
  </div>
</div>"""

template5 = """
<div class="card %(suit)s" id="%(id)s" data-suit="%(suit)s" data-number="%(number)s">
  <div class="flipper">
    <div class="front">
      <div class="corner top">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
      <span class="suit top left">%(symbol)s</span>
      <span class="suit top right">%(symbol)s</span>
      <span class="suit middle center">%(symbol)s</span>
      <span class="suit bottom left">%(symbol)s</span>
      <span class="suit bottom right">%(symbol)s</span>
      <div class="corner bottom">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
    </div>
    <div class="back"></div>
  </div>
</div>"""

template6 = """
<div class="card %(suit)s" id="%(id)s" data-suit="%(suit)s" data-number="%(number)s">
  <div class="flipper">
    <div class="front">
      <div class="corner top">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
      <span class="suit top left">%(symbol)s</span>
      <span class="suit top right">%(symbol)s</span>
      <span class="suit middle left">%(symbol)s</span>
      <span class="suit middle right">%(symbol)s</span>
      <span class="suit bottom left">%(symbol)s</span>
      <span class="suit bottom right">%(symbol)s</span>
      <div class="corner bottom">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
    </div>
    <div class="back"></div>
  </div>
</div>"""

template7 = """
<div class="card %(suit)s" id="%(id)s" data-suit="%(suit)s" data-number="%(number)s">
  <div class="flipper">
    <div class="front">
      <div class="corner top">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
      <span class="suit top left">%(symbol)s</span>
      <span class="suit top right">%(symbol)s</span>
      <span class="suit under-top center">%(symbol)s</span>
      <span class="suit middle left">%(symbol)s</span>
      <span class="suit middle right">%(symbol)s</span>
      <span class="suit bottom left">%(symbol)s</span>
      <span class="suit bottom right">%(symbol)s</span>
      <div class="corner bottom">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
    </div>
    <div class="back"></div>
  </div>
</div>"""

template8 = """
<div class="card %(suit)s" id="%(id)s" data-suit="%(suit)s" data-number="%(number)s">
  <div class="flipper">
    <div class="front">
      <div class="corner top">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
      <span class="suit top left">%(symbol)s</span>
      <span class="suit top right">%(symbol)s</span>
      <span class="suit under-top center">%(symbol)s</span>
      <span class="suit middle left">%(symbol)s</span>
      <span class="suit middle right">%(symbol)s</span>
      <span class="suit over-bottom center">%(symbol)s</span>
      <span class="suit bottom left">%(symbol)s</span>
      <span class="suit bottom right">%(symbol)s</span>
      <div class="corner bottom">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
    </div>
    <div class="back"></div>
  </div>
</div>"""

template9 = """
<div class="card %(suit)s" id="%(id)s" data-suit="%(suit)s" data-number="%(number)s">
  <div class="flipper">
    <div class="front">
      <div class="corner top">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
      <span class="suit top left">%(symbol)s</span>
      <span class="suit top right">%(symbol)s</span>
      <span class="suit under-top center">%(symbol)s</span>
      <span class="suit over-middle left">%(symbol)s</span>
      <span class="suit over-middle right">%(symbol)s</span>
      <span class="suit under-middle left">%(symbol)s</span>
      <span class="suit under-middle right">%(symbol)s</span>
      <span class="suit bottom left">%(symbol)s</span>
      <span class="suit bottom right">%(symbol)s</span>
      <div class="corner bottom">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
    </div>
    <div class="back"></div>
  </div>
</div>"""

template10 = """
<div class="card %(suit)s" id="%(id)s" data-suit="%(suit)s" data-number="%(number)s">
  <div class="flipper">
    <div class="front">
      <div class="corner top">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
      <span class="suit top left">%(symbol)s</span>
      <span class="suit top right">%(symbol)s</span>
      <span class="suit under-top center">%(symbol)s</span>
      <span class="suit over-middle left">%(symbol)s</span>
      <span class="suit over-middle right">%(symbol)s</span>
      <span class="suit under-middle left">%(symbol)s</span>
      <span class="suit under-middle right">%(symbol)s</span>
      <span class="suit over-bottom center">%(symbol)s</span>
      <span class="suit bottom left">%(symbol)s</span>
      <span class="suit bottom right">%(symbol)s</span>
      <div class="corner bottom">
        <span class="number">%(number)s</span>
        <span>%(symbol)s</span>
      </div>
    </div>
    <div class="back"></div>
  </div>
</div>"""

CARD_TEMPLATES = (
  ('A', templateA),
  ('2', template2),
  ('3', template3),
  ('4', template4),
  ('5', template5),
  ('6', template6),
  ('7', template7),
  ('8', template8),
  ('9', template9),
  ('10', template10),
  ('J', templateA),
  ('Q', templateA),
  ('K', templateA),
)


def main(args):
  parser = argparse.ArgumentParser(description='Create card templates')
  parser.add_argument("suit", type=str, choices=SUIT_MAP.keys(),
                      help="Suit to create templates for")
  args = parser.parse_args(args)

  for number, template in CARD_TEMPLATES:
    symbol = SUIT_MAP[args.suit]
    id = args.suit[0] + number.lower()  # e.g. d9 for diamond 9
    print template % {'suit': args.suit,
                      'number': number,
                      'symbol': symbol,
                      'id': id}


if __name__ == '__main__':
  main(sys.argv[1:])
