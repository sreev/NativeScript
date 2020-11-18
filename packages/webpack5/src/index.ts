import Config from 'webpack-chain';
import webpack from 'webpack';
import { configs } from './configuration';
import { determineProjectFlavor } from './helpers/flavor';

export type Platform = 'android' | 'ios' | string;

export interface IWebpackEnv {
	[name: string]: any;

	appPath?: string;
	appResourcesPath?: string;

	android?: boolean;
	ios?: boolean;

	production?: boolean;
	report?: boolean;
	hmr?: boolean;
	// todo: add others
}

let webpackChains: any[] = [];
let webpackMerges: any[] = [];
let env: IWebpackEnv = {};
let explicitUseConfig = false;

////// PUBLIC API
export const defaultConfigs = configs;

export function init(_env: IWebpackEnv) {
	if (_env) {
		env = _env;
	}
}

export function useConfig(config: keyof typeof defaultConfigs) {
	explicitUseConfig = true;
	webpackChains.push(configs[config]);
}

export function chainWebpack(chainFn: (config: Config, env: IWebpackEnv) => any) {
	webpackChains.push(chainFn);
}

export function mergeWebpack(mergeFn: (config: Partial<webpack.Configuration>, env: IWebpackEnv) => any | Partial<webpack.Configuration>) {
	webpackMerges.push(mergeFn);
}

export function resolveChainableConfig() {
	const config = new Config();

	if (!explicitUseConfig) {
		useConfig(determineProjectFlavor());
	}

	// this applies all chain configs
	webpackChains.forEach((chainFn) => {
		return chainFn(config, env);
	});

	return config;
}

export function resolveConfig(chainableConfig = resolveChainableConfig()) {
	// todo: warn if no base config

	// todo: apply merges from webpackMerges

	// return a config usable by webpack
	return chainableConfig.toConfig();
}
