import { GraphQLResolveInfo } from 'graphql';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Section = {
  __typename?: 'Section';
  prefix: Scalars['Boolean'];
  suffix: Scalars['Boolean'];
  start: Scalars['Int'];
  end: Scalars['Int'];
};

export type Hint = {
  __typename?: 'Hint';
  id: Scalars['Int'];
  key: Scalars['String'];
  areas: Array<Array<Section>>;
  hints: Array<Scalars['String']>;
};

export type Conlang = {
  __typename?: 'Conlang';
  id: Scalars['Int'];
  name: Scalars['String'];
  prefix: Scalars['String'];
  suffix: Scalars['String'];
  separator: Scalars['String'];
};

export type PhraseInput = {
  fromConlang: Scalars['Boolean'];
  sentence: Scalars['String'];
  area: Array<SectionInput>;
};

export type SectionInput = {
  prefix: Scalars['Boolean'];
  suffix: Scalars['Boolean'];
  start: Scalars['Int'];
  end: Scalars['Int'];
};

export type Query = {
  __typename?: 'Query';
  hint: Array<Hint>;
  conlang?: Maybe<Conlang>;
};


export type QueryHintArgs = {
  conlang: Scalars['Int'];
  phrase: PhraseInput;
};


export type QueryConlangArgs = {
  id: Scalars['Int'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addNewHint?: Maybe<Hint>;
  addHint?: Maybe<Array<Scalars['String']>>;
  setHint?: Maybe<Array<Scalars['String']>>;
  removeHint?: Maybe<Array<Scalars['String']>>;
  removeEntireHint: Scalars['Boolean'];
};


export type MutationAddNewHintArgs = {
  conlang: Scalars['Int'];
  phrase: PhraseInput;
  hint: Scalars['String'];
};


export type MutationAddHintArgs = {
  hint: Scalars['Int'];
  string: Scalars['String'];
};


export type MutationSetHintArgs = {
  hint: Scalars['Int'];
  index: Scalars['Int'];
  string: Scalars['String'];
};


export type MutationRemoveHintArgs = {
  hint: Scalars['Int'];
  index: Scalars['Int'];
};


export type MutationRemoveEntireHintArgs = {
  hint: Scalars['Int'];
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Section: ResolverTypeWrapper<Section>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Hint: ResolverTypeWrapper<Hint>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Conlang: ResolverTypeWrapper<Conlang>;
  PhraseInput: PhraseInput;
  SectionInput: SectionInput;
  Query: ResolverTypeWrapper<{}>;
  Mutation: ResolverTypeWrapper<{}>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Section: Section;
  Boolean: Scalars['Boolean'];
  Int: Scalars['Int'];
  Hint: Hint;
  String: Scalars['String'];
  Conlang: Conlang;
  PhraseInput: PhraseInput;
  SectionInput: SectionInput;
  Query: {};
  Mutation: {};
}>;

export type SectionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Section'] = ResolversParentTypes['Section']> = ResolversObject<{
  prefix?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  suffix?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  start?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  end?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type HintResolvers<ContextType = any, ParentType extends ResolversParentTypes['Hint'] = ResolversParentTypes['Hint']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  areas?: Resolver<Array<Array<ResolversTypes['Section']>>, ParentType, ContextType>;
  hints?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ConlangResolvers<ContextType = any, ParentType extends ResolversParentTypes['Conlang'] = ResolversParentTypes['Conlang']> = ResolversObject<{
  id?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  prefix?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  suffix?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  separator?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  hint?: Resolver<Array<ResolversTypes['Hint']>, ParentType, ContextType, RequireFields<QueryHintArgs, 'conlang' | 'phrase'>>;
  conlang?: Resolver<Maybe<ResolversTypes['Conlang']>, ParentType, ContextType, RequireFields<QueryConlangArgs, 'id'>>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  addNewHint?: Resolver<Maybe<ResolversTypes['Hint']>, ParentType, ContextType, RequireFields<MutationAddNewHintArgs, 'conlang' | 'phrase' | 'hint'>>;
  addHint?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType, RequireFields<MutationAddHintArgs, 'hint' | 'string'>>;
  setHint?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType, RequireFields<MutationSetHintArgs, 'hint' | 'index' | 'string'>>;
  removeHint?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType, RequireFields<MutationRemoveHintArgs, 'hint' | 'index'>>;
  removeEntireHint?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationRemoveEntireHintArgs, 'hint'>>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  Section?: SectionResolvers<ContextType>;
  Hint?: HintResolvers<ContextType>;
  Conlang?: ConlangResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
}>;


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = any> = Resolvers<ContextType>;
