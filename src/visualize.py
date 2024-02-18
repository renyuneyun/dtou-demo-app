#!/usr/bin/env python

import json
import sys
from matplotlib import pyplot as plt
import numpy as np
import seaborn as sns
import pandas as pd
from pprint import pprint
import argparse

DATA_VER = 3
# 1: Very basic of everything together
# 2: Explicit conflict, obligations and derivation
# 3: On top of 2, add base and base 2
# 4: Only check conflict, but each task separately
# 5: Only obligations and derivation, mainly to be used by app:numData

if DATA_VER == 1:
    COLUMNS = ['Variable', 'Value', 'Time']
else:
    COLUMNS = ['Variable', 'Value', 'Time', 'Task']

if DATA_VER == 2:
    TIME_ORDER = ['conflict', 'obligation', 'derivation']
elif DATA_VER == 3:
    # TIME_ORDER = ['base', 'base2', 'conflict', 'obligation', 'derivation']
    # Base: Load all policies, but no inference rules
    # Base2: Load all policies and basic inference, but not actual results
    TIME_ORDER = ['base', 'base2', 'Conformance', 'Obligation', 'Derivation']
elif DATA_VER == 4:
    # TIME_ORDER = ['base', 'base2', 'bare', 'conflict1', 'conflict2', 'conflict3']
    # Bare: Only helpers for conflict checking
    # Conflict1: UnsatisfiedRequirement
    # Conflict2: UnmatchedExpectation
        # Conflict2v2: UnmatchedExpectation with ForwardLink-like method
    # Conflict3: ProhibitedUse
    TIME_ORDER = ['base', 'base2', 'bare', 'UnsatisfiedRequirement', 'UnmatchedExpectation', 'ProhibitedUse']
elif DATA_VER == 5:
    # TIME_ORDER = ['base', 'base2', 'obligation', 'derivation']
    # Base: Load all policies, but no inference rules
    # Base2: Load all policies and basic inference, but not actual results
    TIME_ORDER = ['base', 'base2', 'Obligation', 'Derivation']

def parse_read(data):
    res = []
    for (exp_name, records) in data.items():
        # if exp_name in ['app:numPurpose', 'app:output:numOutput', 'data:obligation:num', 'app:output:numInput']: continue
        # if exp_name in ['app:numData', 'app:numPurpose', 'app:numIntegrity']: continue
        for (k, vl) in records.items():
            if (DATA_VER == 1):
                for v in vl:
                    res.append([exp_name, int(k), v])
            else:
                for vs in vl:
                    for i, ttype in enumerate(TIME_ORDER):
                        if i < 2: continue
                        res.append([exp_name, int(k), float(vs[i]) / 1000, ttype])
                        # res.append([exp_name, int(k), float(vs[i] - vs[1]) / 1000, ttype])
                    # for i, ttype in enumerate(TIME_ORDER):
                    #     if i < 2: continue
                    #     res.append([exp_name, int(k), vs[i] - vs[1], ttype])

    return res

def visualize(df, start=0):
    sns.set(font_scale=1.75)
    if DATA_VER == 1:
        # sns.catplot(data=df, x="value", y="time", hue='variable', kind="point", order=np.arange(1000))
        # sns.catplot(data=df, x="value", y="time", hue='variable', kind="point")
        # sns.relplot(data=df, kind='line', x="value", y="time", hue='variable')
        sns.lmplot(data=df, x="Value", y="Time", hue='Variable')
        # sns.lmplot(data=df, order=2, x="value", y="time", hue='variable')
    else:
        # sns.lmplot(data=df, x="value", y="time", hue='variable', col='type', order=2, scatter_kws={'alpha':0.5})
        sns.relplot(data=df, x="Value", y="Time", hue='Variable', col='Task', kind='line') \
            .set_axis_labels('Count (Value)', 'Time (s)') \
            .set_titles(col_template='{col_name}') \
            .tight_layout()
            # .set(xlabel='Count', ylabel='Time (s)', title=)
        # sns.relplot(data=df, x="Value", y="Time", hue='Variable', col='Task', kind='scatter') \
        #     .set_axis_labels('Count (Value)', 'Time (s)') \
        #     .set_titles(col_template='{col_name}')
        #     # .set(xlabel='Count', ylabel='Time (s)')
        # fg = sns.relplot(data=df, x="value", y="time", hue='variable', col='type', kind='line')
        # sns.scatterplot(data=df, x="value", y="time", hue='variable', ax=fg.)
        # sns.relplot(data=df, x="value", y="time", hue='type', style='variable', kind='line')

def read_data_single(fd, with_column=False):
    data = json.loads(fd.read())
    df_new = pd.DataFrame(parse_read(data))
    if with_column:
        df_new.columns = COLUMNS
    return df_new

def read_data(log_files):
    dfs = []
    for lf in log_files:
        with open(lf) as fd:
            df_new = read_data_single(fd)
            # df_new.columns = df.columns
            dfs.append(df_new)
    df = pd.concat(dfs)
    df.columns=COLUMNS
    return df


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('log_file', nargs='*')
    args = parser.parse_args()

    if (args.log_file):
        df = read_data(args.log_file)
        visualize(df)
    else:
        df = read_data_single(sys.stdin, with_column=True)
        visualize(df)
    plt.show()

main()