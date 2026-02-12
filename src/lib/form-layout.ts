import type { FieldConfig, FieldConfigs, GroupConfig, SetConfig } from "@/types/form-types";

export type LayoutNode =
  | { type: "field"; name: string; config: FieldConfig<unknown> }
  | { type: "group"; name: string; config: GroupConfig; children: Array<LayoutNode> }
  | { type: "set"; name: string; config: SetConfig; children: Array<LayoutNode> };

/**
 * Parses the configuration object and groups adjacent fields based on 'set' and 'group' properties.
 * Precedence: Set > Group > Field
 */
export function buildLayoutTree<TData extends Record<string, unknown>>(
  configs: FieldConfigs<TData>,
): Array<LayoutNode> {
  const nodes: Array<LayoutNode> = [];
  const entries = Object.entries(configs);

  let i = 0;
  while (i < entries.length) {
    const [name, config] = entries[i];

    // 1. Handle SETS (Highest Priority)
    if (config.set) {
      const setName = config.set.legend || "default-set";
      const setChildren: FieldConfigs<any> = {}; // Temporary grouping object

      // Look ahead for items in the same Set
      let j = i;
      while (j < entries.length && entries[j][1].set?.legend === config.set.legend) {
        // Remove the 'set' and 'group' properties to prevent infinite recursion
        // and conflicting grouping (set takes precedence over group)
        const { set, group, ...configWithoutSetAndGroup } = entries[j][1];
        setChildren[entries[j][0]] = configWithoutSetAndGroup;
        j++;
      }

      // Recursively build the layout INSIDE the set (to handle Groups inside Sets)
      const innerLayout = buildLayoutTree(setChildren);

      nodes.push({
        type: "set",
        name: setName,
        config: config.set,
        children: innerLayout,
      });

      i = j;
      continue;
    }

    // 2. Handle GROUPS
    if (config.group) {
      const groupName = config.group.name;
      const groupChildren: Array<LayoutNode> = [];

      // Look ahead for items in the same Group
      let j = i;
      while (j < entries.length && entries[j][1].group?.name === groupName) {
        const [gName, gConfig] = entries[j];
        groupChildren.push({
          type: "field",
          name: gName,
          config: gConfig as FieldConfig<unknown>,
        });
        j++;
      }

      nodes.push({
        type: "group",
        name: groupName,
        config: config.group,
        children: groupChildren,
      });

      i = j;
      continue;
    }

    // 3. Handle Single Fields
    nodes.push({
      type: "field",
      name: name,
      config: config as FieldConfig<unknown>,
    });
    i++;
  }

  return nodes;
}
