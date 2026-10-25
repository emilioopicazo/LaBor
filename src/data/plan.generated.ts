// GENERADO por scripts/build-overworld-map.mjs — no editar a mano.
// Plano del predio en metros (para el intro). Fuente de verdad: el generador.
export interface PlanBuilding {
  id: string
  label: string
  poly: Array<[number, number]>
  interior: boolean
  construction: boolean
  group: string
  enterable: boolean
}
export const PLAN = {
  "boundary": [
    [
      0,
      0
    ],
    [
      7.93,
      4.65
    ],
    [
      34.9,
      4.65
    ],
    [
      34.9,
      42.09
    ],
    [
      0.32,
      42.09
    ],
    [
      0,
      29.8
    ]
  ],
  "streetX": 39,
  "ingreso": {
    "x": 34.9,
    "y": 27.35
  },
  "tree": {
    "x": 19.2,
    "y": 7.4,
    "r": 2.4
  },
  "buildings": [
    {
      "id": "veta",
      "label": "VETA",
      "poly": [
        [
          0,
          0
        ],
        [
          7.93,
          4.65
        ],
        [
          5.65,
          4.65
        ],
        [
          5.65,
          17.6
        ],
        [
          0,
          17.6
        ]
      ],
      "interior": false,
      "construction": false,
      "group": "",
      "enterable": true
    },
    {
      "id": "mannno",
      "label": "MANNNO",
      "poly": [
        [
          0,
          17.6
        ],
        [
          5.65,
          17.6
        ],
        [
          5.65,
          29.8
        ],
        [
          0,
          29.8
        ]
      ],
      "interior": false,
      "construction": false,
      "group": "",
      "enterable": true
    },
    {
      "id": "franja-sur",
      "label": "PRÓXIMAMENTE",
      "poly": [
        [
          0,
          29.8
        ],
        [
          5.5,
          29.8
        ],
        [
          5.5,
          42.09
        ],
        [
          0.32,
          42.09
        ]
      ],
      "interior": false,
      "construction": false,
      "group": "",
      "enterable": false
    },
    {
      "id": "pabellon-04",
      "label": "PABELLÓN 04",
      "poly": [
        [
          5.5,
          4.65
        ],
        [
          11.55,
          4.65
        ],
        [
          11.55,
          11.65
        ],
        [
          5.5,
          11.65
        ]
      ],
      "interior": true,
      "construction": false,
      "group": "",
      "enterable": true
    },
    {
      "id": "contraste",
      "label": "CONTRASTE",
      "poly": [
        [
          11.55,
          4.65
        ],
        [
          17.6,
          4.65
        ],
        [
          17.6,
          11.65
        ],
        [
          11.55,
          11.65
        ]
      ],
      "interior": false,
      "construction": false,
      "group": "",
      "enterable": true
    },
    {
      "id": "pabellon-01",
      "label": "PABELLÓN 01",
      "poly": [
        [
          22.9,
          4.65
        ],
        [
          34.9,
          4.65
        ],
        [
          34.9,
          11.46
        ],
        [
          22.9,
          11.46
        ]
      ],
      "interior": false,
      "construction": true,
      "group": "",
      "enterable": true
    },
    {
      "id": "pabellon-02",
      "label": "PABELLÓN 02",
      "poly": [
        [
          22.9,
          11.46
        ],
        [
          34.9,
          11.46
        ],
        [
          34.9,
          18.13
        ],
        [
          22.9,
          18.13
        ]
      ],
      "interior": true,
      "construction": false,
      "group": "",
      "enterable": true
    },
    {
      "id": "pabellon-03",
      "label": "PABELLÓN 03",
      "poly": [
        [
          27.9,
          18.13
        ],
        [
          34.9,
          18.13
        ],
        [
          34.9,
          24.8
        ],
        [
          27.9,
          24.8
        ]
      ],
      "interior": true,
      "construction": false,
      "group": "",
      "enterable": true
    },
    {
      "id": "nave-03",
      "label": "NAVE 03",
      "poly": [
        [
          7.5,
          29.9
        ],
        [
          15.35,
          29.9
        ],
        [
          15.35,
          42.09
        ],
        [
          7.5,
          42.09
        ]
      ],
      "interior": true,
      "construction": false,
      "group": "nave",
      "enterable": true
    },
    {
      "id": "nave-02",
      "label": "NAVE 02",
      "poly": [
        [
          15.35,
          29.9
        ],
        [
          25.05,
          29.9
        ],
        [
          25.05,
          42.09
        ],
        [
          15.35,
          42.09
        ]
      ],
      "interior": true,
      "construction": false,
      "group": "nave",
      "enterable": true
    },
    {
      "id": "nave-01",
      "label": "NAVE 01",
      "poly": [
        [
          25.05,
          29.9
        ],
        [
          34.9,
          29.9
        ],
        [
          34.9,
          42.09
        ],
        [
          25.05,
          42.09
        ]
      ],
      "interior": true,
      "construction": false,
      "group": "nave",
      "enterable": true
    }
  ]
} as const satisfies {
  boundary: ReadonlyArray<readonly [number, number]>
  streetX: number
  ingreso: { x: number; y: number }
  tree: { x: number; y: number; r: number }
  buildings: ReadonlyArray<PlanBuilding>
}
